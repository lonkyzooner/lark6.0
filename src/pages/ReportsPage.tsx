import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  Tag,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Clock3
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';

// Mock data for reports
const MOCK_REPORTS = [
  {
    id: '1',
    title: 'Traffic Stop on Highway 101',
    reportNumber: 'LAPD-23-05-0001',
    reportType: 'traffic',
    status: 'draft',
    incidentDate: new Date('2023-05-15T14:30:00'),
    createdAt: new Date('2023-05-15T16:45:00'),
    updatedAt: new Date('2023-05-15T17:30:00'),
    createdBy: {
      id: '101',
      name: 'Officer Johnson'
    },
    completionScore: 65,
    tags: ['traffic', 'citation', 'speeding']
  },
  {
    id: '2',
    title: 'Domestic Disturbance at 123 Main St',
    reportNumber: 'LAPD-23-05-0002',
    reportType: 'incident',
    status: 'pending_review',
    incidentDate: new Date('2023-05-14T21:15:00'),
    createdAt: new Date('2023-05-14T22:30:00'),
    updatedAt: new Date('2023-05-15T09:15:00'),
    createdBy: {
      id: '102',
      name: 'Officer Martinez'
    },
    completionScore: 95,
    tags: ['domestic', 'disturbance', 'noise complaint']
  },
  {
    id: '3',
    title: 'Arrest of Suspect in Convenience Store Robbery',
    reportNumber: 'LAPD-23-05-0003',
    reportType: 'arrest',
    status: 'approved',
    incidentDate: new Date('2023-05-13T02:45:00'),
    createdAt: new Date('2023-05-13T04:30:00'),
    updatedAt: new Date('2023-05-14T10:00:00'),
    createdBy: {
      id: '103',
      name: 'Officer Williams'
    },
    completionScore: 100,
    tags: ['robbery', 'arrest', 'convenience store']
  },
  {
    id: '4',
    title: 'Investigation of Vehicle Break-in at Downtown Parking Garage',
    reportNumber: 'LAPD-23-05-0004',
    reportType: 'investigation',
    status: 'draft',
    incidentDate: new Date('2023-05-12T18:20:00'),
    createdAt: new Date('2023-05-12T19:45:00'),
    updatedAt: new Date('2023-05-12T20:30:00'),
    createdBy: {
      id: '104',
      name: 'Officer Thompson'
    },
    completionScore: 40,
    tags: ['vehicle', 'break-in', 'theft', 'downtown']
  },
  {
    id: '5',
    title: 'Use of Force During Arrest of Resisting Suspect',
    reportNumber: 'LAPD-23-05-0005',
    reportType: 'use_of_force',
    status: 'pending_review',
    incidentDate: new Date('2023-05-11T23:10:00'),
    createdAt: new Date('2023-05-12T00:30:00'),
    updatedAt: new Date('2023-05-12T10:15:00'),
    createdBy: {
      id: '105',
      name: 'Officer Davis'
    },
    completionScore: 90,
    tags: ['use of force', 'resisting arrest', 'bodycam']
  }
];

// Report type mapping for display
const REPORT_TYPE_MAP = {
  'incident': { label: 'Incident', color: 'bg-blue-500' },
  'arrest': { label: 'Arrest', color: 'bg-red-500' },
  'traffic': { label: 'Traffic', color: 'bg-green-500' },
  'investigation': { label: 'Investigation', color: 'bg-purple-500' },
  'use_of_force': { label: 'Use of Force', color: 'bg-orange-500' },
  'field_interview': { label: 'Field Interview', color: 'bg-teal-500' },
  'other': { label: 'Other', color: 'bg-gray-500' }
};

// Status mapping for display
const STATUS_MAP = {
  'draft': { label: 'Draft', icon: Clock3, color: 'bg-yellow-500' },
  'pending_review': { label: 'Pending Review', icon: AlertTriangle, color: 'bg-blue-500' },
  'approved': { label: 'Approved', icon: CheckCircle, color: 'bg-green-500' },
  'rejected': { label: 'Rejected', icon: AlertTriangle, color: 'bg-red-500' },
  'archived': { label: 'Archived', icon: FileText, color: 'bg-gray-500' }
};

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [activeTab, setActiveTab] = useState('all');

  // Filter and sort reports
  useEffect(() => {
    let filteredReports = [...MOCK_REPORTS];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredReports = filteredReports.filter(report => 
        report.title.toLowerCase().includes(query) || 
        report.reportNumber.toLowerCase().includes(query) ||
        report.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      filteredReports = filteredReports.filter(report => report.reportType === filterType);
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filteredReports = filteredReports.filter(report => report.status === filterStatus);
    }
    
    // Apply tab filter
    if (activeTab === 'my') {
      // In a real app, filter by current user ID
      filteredReports = filteredReports.filter(report => report.createdBy.id === '101');
    } else if (activeTab === 'recent') {
      // Get reports from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filteredReports = filteredReports.filter(report => report.createdAt >= sevenDaysAgo);
    } else if (activeTab === 'pending') {
      filteredReports = filteredReports.filter(report => report.status === 'pending_review');
    }
    
    // Apply sorting
    filteredReports.sort((a, b) => {
      let valueA, valueB;
      
      if (sortBy === 'title') {
        valueA = a.title;
        valueB = b.title;
      } else if (sortBy === 'reportNumber') {
        valueA = a.reportNumber;
        valueB = b.reportNumber;
      } else if (sortBy === 'incidentDate') {
        valueA = a.incidentDate.getTime();
        valueB = b.incidentDate.getTime();
      } else if (sortBy === 'createdAt') {
        valueA = a.createdAt.getTime();
        valueB = b.createdAt.getTime();
      } else if (sortBy === 'updatedAt') {
        valueA = a.updatedAt.getTime();
        valueB = b.updatedAt.getTime();
      } else if (sortBy === 'completionScore') {
        valueA = a.completionScore;
        valueB = b.completionScore;
      } else {
        valueA = a.updatedAt.getTime();
        valueB = b.updatedAt.getTime();
      }
      
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setReports(filteredReports);
  }, [searchQuery, filterType, filterStatus, sortBy, sortOrder, activeTab]);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle creating a new report
  const handleCreateReport = () => {
    navigate('/reports/new');
  };

  // Handle opening a report
  const handleOpenReport = (reportId: string) => {
    navigate(`/reports/${reportId}`);
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Manage and create incident reports</p>
        </div>
        <Button onClick={handleCreateReport} className="flex items-center gap-2">
          <Plus size={16} />
          <span>New Report</span>
        </Button>
      </div>

      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="my">My Reports</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search reports..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="incident">Incident</SelectItem>
              <SelectItem value="arrest">Arrest</SelectItem>
              <SelectItem value="traffic">Traffic</SelectItem>
              <SelectItem value="investigation">Investigation</SelectItem>
              <SelectItem value="use_of_force">Use of Force</SelectItem>
              <SelectItem value="field_interview">Field Interview</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                <span>Sort</span>
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('updatedAt')}>
                Last Updated {sortBy === 'updatedAt' && (sortOrder === 'desc' ? '↓' : '↑')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('createdAt')}>
                Created Date {sortBy === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('incidentDate')}>
                Incident Date {sortBy === 'incidentDate' && (sortOrder === 'desc' ? '↓' : '↑')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('title')}>
                Title {sortBy === 'title' && (sortOrder === 'desc' ? '↓' : '↑')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('completionScore')}>
                Completion {sortBy === 'completionScore' && (sortOrder === 'desc' ? '↓' : '↑')}
              </DropdownMenuItem>
              <Separator className="my-2" />
              <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                {sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {reports.length === 0 ? (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No reports found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterType !== 'all' || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first report to get started'}
            </p>
            <Button onClick={handleCreateReport}>Create New Report</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <Card 
              key={report.id} 
              className="w-full cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleOpenReport(report.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{report.title}</CardTitle>
                    <CardDescription>{report.reportNumber}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={`${REPORT_TYPE_MAP[report.reportType as keyof typeof REPORT_TYPE_MAP].color} text-white`}
                    >
                      {REPORT_TYPE_MAP[report.reportType as keyof typeof REPORT_TYPE_MAP].label}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`border-2 border-${STATUS_MAP[report.status as keyof typeof STATUS_MAP].color.replace('bg-', '')}`}
                    >
                      <span className="flex items-center gap-1">
                        {React.createElement(STATUS_MAP[report.status as keyof typeof STATUS_MAP].icon, { size: 14 })}
                        {STATUS_MAP[report.status as keyof typeof STATUS_MAP].label}
                      </span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Incident: {formatDate(report.incidentDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>Updated: {formatDate(report.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{report.createdBy.name}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Completion</span>
                    <span className="text-sm">{report.completionScore}%</span>
                  </div>
                  <Progress value={report.completionScore} className="h-2" />
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {report.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <Tag size={12} />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
