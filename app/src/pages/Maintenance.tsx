import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Building,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { MaintenanceRequest, MaintenanceStatus, Priority, MaintenanceCategory } from '@/types';

const mockRequests: MaintenanceRequest[] = [
  {
    id: '1',
    title: 'Water leakage in bathroom',
    description: 'There is a water leak from the ceiling in the master bathroom.',
    category: 'PLUMBING',
    priority: 'HIGH',
    status: 'PENDING',
    requestedBy: '1',
    requestedByName: 'John Doe',
    apartmentNumber: 'A-101',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: [],
  },
  {
    id: '2',
    title: 'AC not cooling properly',
    description: 'The living room AC is not cooling properly.',
    category: 'HVAC',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    requestedBy: '2',
    requestedByName: 'Jane Smith',
    apartmentNumber: 'B-202',
    assignedTo: '3',
    assignedToName: 'Mike Worker',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    images: [],
  },
  {
    id: '3',
    title: 'Door handle broken',
    description: 'The main door handle is loose and needs replacement.',
    category: 'CARPENTRY',
    priority: 'LOW',
    status: 'COMPLETED',
    requestedBy: '1',
    requestedByName: 'John Doe',
    apartmentNumber: 'A-101',
    completedAt: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    images: [],
  },
];

const getStatusBadge = (status: MaintenanceStatus) => {
  const styles: Record<MaintenanceStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ASSIGNED: 'bg-blue-100 text-blue-800 border-blue-200',
    IN_PROGRESS: 'bg-orange-100 text-orange-800 border-orange-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return styles[status] || styles.PENDING;
};

const getPriorityBadge = (priority: Priority) => {
  const styles: Record<Priority, string> = {
    LOW: 'bg-gray-100 text-gray-800 border-gray-200',
    MEDIUM: 'bg-blue-100 text-blue-800 border-blue-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    URGENT: 'bg-red-100 text-red-800 border-red-200',
  };
  return styles[priority] || styles.LOW;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export default function Maintenance() {
  const { user, hasRole } = useAuth();
  const [requests, setRequests] = useState<MaintenanceRequest[]>(mockRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<MaintenanceStatus | 'ALL'>('ALL');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestedByName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.apartmentNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeTab === 'ALL' || r.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    inProgress: requests.filter(r => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length,
    completed: requests.filter(r => r.status === 'COMPLETED').length,
  };

  const canAssign = hasRole(['SOCIETY_ADMIN', 'SOCIETY_WORKER']);
  const canUpdate = hasRole(['SOCIETY_ADMIN', 'SOCIETY_WORKER']);

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Maintenance Requests</h1>
                <p className="text-muted-foreground mt-1">
                  Track and manage maintenance requests
                </p>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Maintenance Request</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input placeholder="Brief description of the issue" />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PLUMBING">Plumbing</SelectItem>
                          <SelectItem value="ELECTRICAL">Electrical</SelectItem>
                          <SelectItem value="CARPENTRY">Carpentry</SelectItem>
                          <SelectItem value="PAINTING">Painting</SelectItem>
                          <SelectItem value="HVAC">HVAC</SelectItem>
                          <SelectItem value="CLEANING">Cleaning</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea placeholder="Detailed description of the issue..." rows={4} />
                    </div>
                    <Button className="w-full" onClick={() => {
                      toast.success('Maintenance request created');
                      setIsAddDialogOpen(false);
                    }}>
                      Submit Request
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Requests', value: stats.total, icon: Wrench, color: 'bg-blue-100 text-blue-600' },
              { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
              { label: 'In Progress', value: stats.inProgress, icon: AlertCircle, color: 'bg-orange-100 text-orange-600' },
              { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
            ].map((stat) => (
              <Card key={stat.label} className="hover:shadow-3d transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Requests List */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MaintenanceStatus | 'ALL')}>
            <TabsList className="mb-6">
              <TabsTrigger value="ALL">All</TabsTrigger>
              <TabsTrigger value="PENDING">Pending</TabsTrigger>
              <TabsTrigger value="ASSIGNED">Assigned</TabsTrigger>
              <TabsTrigger value="IN_PROGRESS">In Progress</TabsTrigger>
              <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {filteredRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    variants={itemVariants}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{request.title}</h3>
                              <Badge variant="outline" className={getPriorityBadge(request.priority)}>
                                {request.priority}
                              </Badge>
                              <Badge variant="outline" className={getStatusBadge(request.status)}>
                                {request.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {request.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {request.requestedByName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {request.apartmentNumber}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(request.createdAt).toLocaleDateString()}
                              </span>
                              <span className="px-2 py-0.5 bg-muted rounded text-xs">
                                {request.category}
                              </span>
                            </div>
                            {request.assignedToName && (
                              <p className="text-sm mt-2">
                                <span className="text-muted-foreground">Assigned to:</span>{' '}
                                <span className="font-medium">{request.assignedToName}</span>
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {request.status === 'PENDING' && canAssign && (
                              <Button size="sm" className="gap-1">
                                <User className="h-4 w-4" />
                                Assign
                              </Button>
                            )}
                            {(request.status === 'ASSIGNED' || request.status === 'IN_PROGRESS') && canUpdate && (
                              <Button size="sm" variant="outline" className="gap-1">
                                <ArrowRight className="h-4 w-4" />
                                Update
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {filteredRequests.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold">No requests found</h3>
                      <p className="text-muted-foreground">
                        {searchQuery ? 'Try adjusting your search' : 'No maintenance requests in this category'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
