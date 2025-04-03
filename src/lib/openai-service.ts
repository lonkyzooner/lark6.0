import axios from 'axios';
import { matchCommand as matchLocalCommand } from './command-matcher';
import { processOfflineCommand } from './offline-commands';
import { processCommandChain } from './command-chain-processor';
import { commandContext } from './command-context';
import { commandAnalytics } from './command-analytics';
import { commandPredictor } from './command-predictor';
import { commandLearning } from './command-learning';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Track API configuration status
export const apiConfigStatus = {
  checked: false,
  configured: false,
  error: null as string | null
};

console.log('OpenAI service initialized to use secure backend API endpoints');

// Check API configuration on startup
checkAPIConfiguration().catch(err => {
  console.error('Error checking API configuration:', err);
  apiConfigStatus.error = 'Failed to check API configuration';
});

// Function to check API configuration
async function checkAPIConfiguration() {
  try {
    const response = await fetch(`${API_URL}/config`);
    if (response.ok) {
      const data = await response.json();
      apiConfigStatus.configured = data.config?.openai?.configured || false;
      apiConfigStatus.checked = true;
      apiConfigStatus.error = null;
      console.log(`API configuration checked: OpenAI ${apiConfigStatus.configured ? 'configured' : 'not configured'}`);
    } else {
      apiConfigStatus.error = 'API configuration endpoint not available';
      apiConfigStatus.checked = true;
    }
  } catch (error) {
    console.error('Error checking API configuration:', error);
    apiConfigStatus.error = 'Failed to check API configuration';
    apiConfigStatus.checked = true;
  }
}

// Create axios instance for API calls with enhanced error handling
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000 // 15 seconds timeout
});

// Add request interceptor for logging
api.interceptors.request.use(config => {
  console.log(`[API] ${config.method?.toUpperCase()} request to ${config.url}`);
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Handle network errors
    if (!error.response) {
      console.error('[API] Network error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('[API] Request timeout:', error.message);
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }

    // Handle API errors with status codes
    const status = error.response.status;
    const errorData = error.response.data;

    console.error(`[API] Error ${status}:`, errorData);

    // Customize error message based on status code
    let errorMessage = 'An error occurred while processing your request.';

    if (status === 401 || status === 403) {
      errorMessage = 'Authentication error. Please check your credentials.';
    } else if (status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (status === 429) {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }

    // Use error message from API if available
    if (errorData && errorData.error) {
      errorMessage = errorData.error;
    }

    return Promise.reject(new Error(errorMessage));
  }
);


// Command execution state and types
type CommandState = {
  inProgress: boolean;
  lastCommand?: string;
  lastAction?: string;
  context: Record<string, unknown>;
  offline: boolean;
};

const commandState: CommandState = {
  inProgress: false,
  context: {},
  offline: false // Track offline status
};

// Check internet connectivity with retry mechanism
async function checkConnectivity(retries = 2): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'HEAD',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (response.ok) {
      // Connection successful
      if (commandState.offline) {
        console.log('Network connectivity restored');
      }
      commandState.offline = false;
      return true;
    } else {
      // Server responded but with an error
      console.warn(`Health check failed with status: ${response.status}`);
      commandState.offline = true;
      return false;
    }
  } catch (error) {
    console.log('Network connectivity issue detected');

    // Retry logic
    if (retries > 0) {
      console.log(`Retrying connectivity check... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      return checkConnectivity(retries - 1);
    }

    console.log('Switching to offline mode after failed retries');
    commandState.offline = true;
    return false;
  }
}

export interface CommandParameters {
  language?: string;
  statute?: string;
  threat?: string;
  query?: string;
  location?: string; // Added location parameter
}

export interface CommandResponse {
  command: string;
  action: 'miranda' | 'statute' | 'threat' | 'tactical' | 'unknown' | 'general_query';
  parameters?: CommandParameters;
  executed: boolean;
  result?: string;
  error?: string;
  metadata?: Record<string, any>;
}

import { matchCommand } from './command-matcher';

// Process and execute voice commands
export async function processVoiceCommand(transcript: string): Promise<CommandResponse> {
  console.log('Processing voice command:', transcript);
  const startTime = Date.now();

  // For text chat input, we want to ensure commands are always processed
  // even if another command is in progress
  if (commandState.inProgress) {
    console.log('Command processing already in progress, but proceeding for text input');
    // We'll continue processing for text input to improve responsiveness
  }

  // Check for command corrections
  const correctedCommand = commandLearning.suggestCorrection(transcript);
  if (correctedCommand && correctedCommand !== transcript.toLowerCase()) {
    console.log(`Corrected command: ${transcript} -> ${correctedCommand}`);
    transcript = correctedCommand;
  }

  commandState.inProgress = true;
  commandState.lastCommand = transcript;

  try {
    // Check for command chain
    if (transcript.includes(' and ') || transcript.includes(' then ')) {
      console.log('Detected command chain, processing multiple commands');
      const results = await processCommandChain(transcript);
      commandState.inProgress = false;
      // Return the last command's result
      return results[results.length - 1];
    }

    // First, try offline command processing
    const offlineResult = await processOfflineCommand(transcript);
    if (offlineResult) {
      console.log('Command processed offline:', offlineResult);
      commandState.inProgress = false;
      commandAnalytics.recordCommand({
        command: transcript,
        success: true,
        responseTime: Date.now() - startTime,
        confidence: 1.0,
        offline: true,
        commandType: offlineResult.action || 'general_query'
      });
      return offlineResult;
    }

    // Then, try local command matching
    const localMatch = matchLocalCommand(transcript);
    if (localMatch) {
      console.log('Command matched locally:', localMatch);
      const result = await executeCommand(localMatch);
      commandState.inProgress = false;
      commandAnalytics.recordCommand({
        command: transcript,
        success: result.executed,
        responseTime: Date.now() - startTime,
        confidence: 0.9,
        offline: true,
        commandType: result.action || 'general_query'
      });
      return result;
    }

    // Check connectivity before using API
    if (!await checkConnectivity()) {
      console.log('No internet connection, limited to offline commands');
      commandState.inProgress = false;
      return {
        command: transcript,
        action: 'unknown',
        executed: false,
        error: 'No internet connection. Only basic commands are available.'
      };
    }

    console.log('Using secure backend API for command interpretation');

    try {
      // Call our secure backend API endpoint
      const response = await api.post('/openai/process-command', {
        transcript
      });

      if (response.data.success) {
        const result = response.data;
        console.log('Command execution result from API:', result);

        commandState.inProgress = false;
        return {
          command: result.command,
          action: result.action,
          parameters: result.parameters,
          executed: result.executed,
          result: result.result,
          error: result.error,
          metadata: result.metadata
        };
      } else {
        throw new Error(response.data.error || 'Unknown error from API');
      }
    } catch (apiError) {
      console.error('Error calling API:', apiError);
      // If API call fails, try to use a fallback response
      const fallbackResponse: CommandResponse = {
        command: transcript,
        action: 'general_query',
        parameters: { query: transcript },
        executed: false,
        error: apiError instanceof Error ? apiError.message : 'Error communicating with API'
      };

      commandState.inProgress = false;
      return fallbackResponse;
    }
  } catch (error) {
    console.error("Error processing voice command:", error);
    commandState.inProgress = false;
    return {
      command: transcript,
      action: "unknown",
      executed: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Get information about a specific legal statute
export async function getLegalInformation(statute: string): Promise<string> {
  try {
    console.log('Getting legal information for statute:', statute);

    // Call our secure backend API endpoint
    const response = await api.post('/openai/legal', {
      statute
    });

    if (response.data.success) {
      return response.data.result;
    } else {
      throw new Error(response.data.error || 'Unknown error from API');
    }
  } catch (error) {
    console.error("Error getting legal information:", error);
    return "An error occurred while retrieving statute information.";
  }
}

// General knowledge query function for answering any law enforcement related questions
export async function getGeneralKnowledge(query: string): Promise<string> {
  try {
    console.log('Getting general knowledge for query:', query);

    // Call our secure backend API endpoint
    const response = await api.post('/openai/general', {
      query
    });

    if (response.data.success) {
      return response.data.result;
    } else {
      throw new Error(response.data.error || 'Unknown error from API');
    }
  } catch (error) {
    console.error("Error getting general knowledge:", error);
    return "I apologize, but I'm experiencing a technical issue retrieving that information.";
  }
}

// Function for tactical situation assessment
// Execute identified commands
async function executeCommand(command: CommandResponse): Promise<CommandResponse> {
  try {
    let result = '';
    console.log('Executing command:', command.action, command);

    // Handle case where command might be undefined or null
    if (!command || !command.action) {
      return {
        command: command?.command || 'Unknown command',
        action: 'general_query',
        executed: true,
        result: 'I\'m not sure how to process that command. Could you please rephrase it?'
      };
    }

    switch (command.action) {
      case 'miranda':
        // Use command context for language preference
        const language = command.parameters?.language || commandContext.getLanguagePreference() || 'english';
        commandContext.setLanguagePreference(language);
        result = `Miranda rights will be read in ${language}`;

        // Return with specific metadata to ensure the language is passed to the UI
        return {
          ...command,
          executed: true,
          result,
          metadata: { language }
        };
        break;

      case 'statute':
        if (command.parameters?.statute) {
          commandContext.setLastStatute(command.parameters.statute);
          result = await getLegalInformation(command.parameters.statute);
        } else {
          // Try to use last accessed statute from context
          const lastStatute = commandContext.getLastStatute();
          if (lastStatute) {
            result = await getLegalInformation(lastStatute);
          } else {
            // For general statute queries without a specific statute
            result = await getGeneralKnowledge(command.command);
          }
        }
        break;

      case 'threat':
        // Use command context for threat assessment
        commandContext.updateThreatContext(command.parameters?.location);

        // If recent assessment exists, include it in the response
        if (commandContext.isRecentThreatAssessment()) {
          const lastAssessment = commandContext.getLastThreatAssessment();
          if (lastAssessment && lastAssessment.timestamp) {
            result = `Recent threat assessment from ${new Date(lastAssessment.timestamp).toLocaleTimeString()}: `;
          }
        }

        result += await assessThreatLevel(command.parameters?.threat || command.command);
        break;

      case 'tactical':
        result = await assessTacticalSituation(command.command);
        break;

      case 'general_query':
        result = await getGeneralKnowledge(command.parameters?.query || command.command);
        break;

      case 'unknown':
        // For unknown commands, treat them as general queries
        result = await getGeneralKnowledge(command.command);
        break;

      default:
        // Default to general knowledge for any unrecognized action
        result = await getGeneralKnowledge(command.command);
    }

    return {
      ...command,
      executed: true,
      result
    };
  } catch (error) {
    return {
      ...command,
      executed: false,
      error: error instanceof Error ? error.message : 'Error executing command'
    };
  }
}

// New function to assess threat levels
async function assessThreatLevel(situation: string): Promise<string> {
  try {
    console.log('Assessing threat level for situation:', situation);

    // Call our secure backend API endpoint
    const response = await api.post('/openai/threat', {
      situation
    });

    if (response.data.success) {
      return response.data.result;
    } else {
      throw new Error(response.data.error || 'Unknown error from API');
    }
  } catch (error) {
    console.error("Error assessing threat level:", error);
    return "Unable to assess threat level at this time.";
  }
}

export async function assessTacticalSituation(situation: string): Promise<string> {
  try {
    console.log('Assessing tactical situation:', situation);

    // Call our secure backend API endpoint
    const response = await api.post('/openai/tactical', {
      situation
    });

    if (response.data.success) {
      return response.data.result;
    } else {
      throw new Error(response.data.error || 'Unknown error from API');
    }
  } catch (error) {
    console.error("Error assessing tactical situation:", error);
    return "Unable to process tactical assessment at this time.";
  }
}