// Vercel API endpoint for OpenAI interactions
const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const NodeCache = require('node-cache');
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware for security
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL, 'https://lark-law.com']
    : '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Setup caching
const cache = new NodeCache({
  stdTTL: 600, // 10 minutes standard cache time
  checkperiod: 120, // Check for expired entries every 2 minutes
  useClones: false // For better performance
});

// Rate limiting
const openaiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, error: 'Too many requests to OpenAI API, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Initialize OpenAI with API key from environment variables
let openai;
try {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY environment variable is not set');
    throw new Error('OpenAI API key is not configured');
  }

  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  console.log('OpenAI API initialized successfully');
} catch (error) {
  console.error('Error initializing OpenAI API:', error);
}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
};

// Process voice commands with caching
app.post('/api/openai/process-command', openaiLimiter, async (req, res, next) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        error: 'Transcript is required'
      });
    }

    // Check if OpenAI is initialized
    if (!openai) {
      throw new Error('OpenAI API is not initialized');
    }

    // Generate cache key based on transcript
    const cacheKey = `cmd_${Buffer.from(transcript).toString('base64')}`;

    // Check cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      console.log(`Cache hit for command: ${transcript.substring(0, 30)}...`);
      return res.json(cachedResult);
    }

    console.log(`Processing command: ${transcript}`);

    const prompt = `
      As LARK (Law Enforcement Assistance and Response Kit), I need to interpret voice commands from police officers.
      Based on the following transcript, determine the command and action required:

      Command categories:
      - "miranda": Read Miranda rights (parameters: language)
      - "statute": Look up a statute (parameters: statute number)
      - "threat": Identify potential threats
      - "tactical": Provide tactical guidance
      - "general_query": Answer a general question or request that doesn't fit the other categories
      - "unknown": Command not recognized

      Transcript: "${transcript}"

      Respond with JSON only in this format:
      {
        "command": "original command",
        "action": "miranda|statute|threat|tactical|general_query|unknown",
        "parameters": {
          "language": "english|spanish|french|vietnamese|mandarin|arabic",
          "statute": "statute number",
          "threat": "description",
          "query": "the query to answer if it's a general question"
        }
      }
    `;

    // Start a timer for performance monitoring
    const startTime = Date.now();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are LARK, a police officer's AI assistant, operating like JARVIS from Iron Man. You process voice commands, provide translations, and return structured responses in a professional yet conversational manner." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content;

    try {
      // Parse the JSON response
      const parsedResponse = JSON.parse(responseText);

      // Execute the identified command based on action type
      let result;

      switch (parsedResponse.action) {
        case 'miranda':
          result = await getMirandaRights(parsedResponse.parameters?.language || 'english');
          break;

        case 'statute':
          result = await getLegalInformation(parsedResponse.parameters?.statute || '');
          break;

        case 'threat':
          result = await assessThreat(parsedResponse.parameters?.threat || transcript);
          break;

        case 'tactical':
          result = await assessTacticalSituation(transcript);
          break;

        case 'general_query':
          result = await getGeneralKnowledge(parsedResponse.parameters?.query || transcript);
          break;

        case 'unknown':
          // For unknown commands, treat them as general queries
          result = await getGeneralKnowledge(transcript);
          break;

        default:
          // Default to general knowledge for any unrecognized action
          result = await getGeneralKnowledge(transcript);
      }

      // Calculate processing time
      const processingTime = Date.now() - startTime;
      console.log(`Command processed in ${processingTime}ms: ${transcript.substring(0, 30)}...`);

      // Prepare response
      const response = {
        success: true,
        command: parsedResponse.command,
        action: parsedResponse.action,
        parameters: parsedResponse.parameters,
        executed: true,
        result,
        processingTime
      };

      // Cache the result
      cache.set(cacheKey, response);

      return res.json(response);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);

      // If JSON parsing fails, try to use the raw response as a general query
      const result = await getGeneralKnowledge(transcript);

      // Prepare fallback response
      const fallbackResponse = {
        success: true,
        command: transcript,
        action: 'general_query',
        parameters: { query: transcript },
        executed: true,
        result,
        processingTime: Date.now() - startTime
      };

      // Cache the fallback result
      cache.set(cacheKey, fallbackResponse);

      return res.json(fallbackResponse);
    }
  } catch (error) {
    next(error);
  }
});

// Apply error handler
app.use(errorHandler);

// Get Miranda rights
app.post('/api/openai/miranda', openaiLimiter, async (req, res) => {
  try {
    const { language = 'english' } = req.body;

    const result = await getMirandaRights(language);

    return res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error getting Miranda rights:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get Miranda rights',
      message: error.message
    });
  }
});

// Get legal information
app.post('/api/openai/legal', openaiLimiter, async (req, res) => {
  try {
    const { statute } = req.body;

    if (!statute) {
      return res.status(400).json({
        success: false,
        error: 'Statute is required'
      });
    }

    const result = await getLegalInformation(statute);

    return res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error getting legal information:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get legal information',
      message: error.message
    });
  }
});

// Assess threat
app.post('/api/openai/threat', openaiLimiter, async (req, res) => {
  try {
    const { situation } = req.body;

    if (!situation) {
      return res.status(400).json({
        success: false,
        error: 'Situation description is required'
      });
    }

    const result = await assessThreat(situation);

    return res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error assessing threat:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to assess threat',
      message: error.message
    });
  }
});

// Assess tactical situation
app.post('/api/openai/tactical', openaiLimiter, async (req, res) => {
  try {
    const { situation } = req.body;

    if (!situation) {
      return res.status(400).json({
        success: false,
        error: 'Situation description is required'
      });
    }

    const result = await assessTacticalSituation(situation);

    return res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error assessing tactical situation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to assess tactical situation',
      message: error.message
    });
  }
});

// Get general knowledge
app.post('/api/openai/general', openaiLimiter, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    const result = await getGeneralKnowledge(query);

    return res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error getting general knowledge:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get general knowledge',
      message: error.message
    });
  }
});

// Text-to-speech endpoint with caching
app.post('/api/openai/tts', openaiLimiter, async (req, res, next) => {
  try {
    const { text, voice = 'alloy' } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    // Check if OpenAI is initialized
    if (!openai) {
      throw new Error('OpenAI API is not initialized');
    }

    // Generate cache key based on text and voice
    const cacheKey = `tts_${voice}_${Buffer.from(text).toString('base64').substring(0, 100)}`;

    // Check cache first
    const cachedAudio = cache.get(cacheKey);
    if (cachedAudio) {
      console.log(`Cache hit for TTS: ${text.substring(0, 30)}...`);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('X-Cache', 'HIT');
      return res.send(cachedAudio);
    }

    console.log(`Generating speech for: ${text.substring(0, 30)}...`);

    // Start a timer for performance monitoring
    const startTime = Date.now();

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice,
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Calculate processing time
    const processingTime = Date.now() - startTime;
    console.log(`Speech generated in ${processingTime}ms for: ${text.substring(0, 30)}...`);

    // Cache the audio buffer
    cache.set(cacheKey, buffer);

    // Set headers
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Processing-Time', processingTime.toString());

    // Send the audio
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

// Helper functions

// Get Miranda rights in different languages
async function getMirandaRights(language = 'english') {
  try {
    const prompt = `
      Provide the Miranda rights in ${language}.
      The response should be formal, accurate, and suitable for a police officer to read to a suspect.
      Include both the warning and the questions asking if they understand their rights.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are LARK's legal module, operating like JARVIS from Iron Man. You specialize in providing accurate legal information in multiple languages while maintaining a professional tone." },
        { role: "user", content: prompt }
      ]
    });

    return completion.choices[0].message.content || "Unable to retrieve Miranda rights at this time.";
  } catch (error) {
    console.error("Error getting Miranda rights:", error);
    return "An error occurred while retrieving Miranda rights.";
  }
}

// Get legal information about statutes
async function getLegalInformation(statute) {
  try {
    const prompt = `
      Provide information about Louisiana statute ${statute}.
      Include the full text if available, a plain language explanation, and any relevant case law.
      If this isn't a valid Louisiana statute, explain what might be the closest match.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are LARK's legal module, operating like JARVIS from Iron Man. You specialize in Louisiana law and can provide translations of legal terms and concepts while maintaining a professional yet conversational tone." },
        { role: "user", content: prompt }
      ]
    });

    return completion.choices[0].message.content || "Unable to retrieve information for this statute.";
  } catch (error) {
    console.error("Error getting legal information:", error);
    return "An error occurred while retrieving statute information.";
  }
}

// Assess threat level
async function assessThreat(situation) {
  try {
    const prompt = `
      Assess the following situation for potential threats:
      "${situation}"

      Provide:
      1. A threat level assessment (Low, Medium, High, Critical)
      2. Specific threats identified
      3. Recommended precautions
      4. Any legal considerations

      Be concise but thorough.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are LARK's threat assessment module, operating like JARVIS from Iron Man. Provide clear, actionable threat assessments while maintaining a professional yet conversational tone. You can translate threats described in other languages when needed." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    return completion.choices[0].message.content || "Unable to assess threat level.";
  } catch (error) {
    console.error("Error assessing threat:", error);
    return "Unable to assess threat level at this time.";
  }
}

// Assess tactical situation
async function assessTacticalSituation(situation) {
  try {
    const systemPrompt = `
      You are LARK's tactical assessment module, designed to assist law enforcement officers in the field.
      Provide clear, concise tactical guidance based on best practices in law enforcement.
      Consider officer safety, civilian safety, legal requirements, and effective resolution.
      Format your response with clear sections and bullet points when appropriate.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Assess this situation and provide tactical considerations: ${situation}` }
      ],
      temperature: 0.5
    });

    return completion.choices[0].message.content || "Unable to assess tactical situation.";
  } catch (error) {
    console.error("Error assessing tactical situation:", error);
    return "Unable to process tactical assessment at this time.";
  }
}

// Get general knowledge
async function getGeneralKnowledge(query) {
  try {
    const systemPrompt = `
      You are LARK, a Law Enforcement Assistance and Response Kit AI assistant.
      Provide helpful, accurate information to law enforcement officers in the field.
      Be concise but thorough, and maintain a professional yet conversational tone.
      If you don't know something or if it's outside your knowledge, say so clearly.
      For legal questions, clarify that your responses are informational and not legal advice.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return completion.choices[0].message.content || "I'm unable to answer that question at the moment.";
  } catch (error) {
    console.error("Error getting general knowledge:", error);
    return "I apologize, but I'm experiencing a technical issue retrieving that information.";
  }
}

// Export for Vercel serverless functions
module.exports = app;
