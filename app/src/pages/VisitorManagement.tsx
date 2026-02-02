import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  QrCode,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  Car,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Visitor, VisitorStatus } from '@/types';

const mockVisitors: Visitor[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    phone: '+91 9876543210',
    email: 'rahul@example.com',
    purpose: 'Visiting friend',
    hostId: '1',
    hostName: 'John Doe',
    hostApartment: 'A-101',
    status: 'PENDING',
    vehicleNumber: 'MH-01-AB-1234',
    societyId: '1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Priya Patel',
    phone: '+91 9876543211',
    purpose: 'Delivery',
    hostId: '2',
    hostName: 'Jane Smith',
    hostApartment: 'B-202',
    entryTime: new Date().toISOString(),
    status: 'CHECKED_IN',
    societyId: '1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    name: 'Amit Kumar',
    phone: '+91 9876543212',
    purpose: 'Maintenance work',
    hostId: '3',
    hostName: 'Mike Worker',
    hostApartment: 'C-303',
    entryTime: new Date(Date.now() - 7200000).toISOString(),
    exitTime: new Date(Date.now() - 3600000).toISOString(),
    status: 'CHECKED_OUT',
    societyId: '1',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

const getStatusBadge = (status: VisitorStatus) => {
  const styles: Record<VisitorStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-blue-100 text-blue-800 border-blue-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    CHECKED_IN: 'bg-green-100 text-green-800 border-green-200',
    CHECKED_OUT: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return styles[status] || styles.PENDING;
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

export default function VisitorManagement() {
  const { user, hasRole } = useAuth();
  const [visitors, setVisitors] = useState<Visitor[]>(mockVisitors);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<VisitorStatus | 'ALL'>('ALL');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredVisitors = visitors.filter(v => {
    const matchesSearch = 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.phone.includes(searchQuery) ||
      v.hostName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeTab === 'ALL' || v.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: visitors.length,
    pending: visitors.filter(v => v.status === 'PENDING').length,
    checkedIn: visitors.filter(v => v.status === 'CHECKED_IN').length,
    checkedOut: visitors.filter(v => v.status === 'CHECKED_OUT').length,
  };

  const handleApprove = (id: string) => {
    setVisitors(visitors.map(v => 
      v.id === id ? { ...v, status: 'APPROVED' } : v
    ));
    toast.success('Visitor approved');
  };

  const handleReject = (id: string) => {
    setVisitors(visitors.map(v => 
      v.id === id ? { ...v, status: 'REJECTED' } : v
    ));
    toast.success('Visitor rejected');
  };

  const handleCheckIn = (id: string) => {
    setVisitors(visitors.map(v => 
      v.id === id ? { ...v, status: 'CHECKED_IN', entryTime: new Date().toISOString() } : v
    ));
    toast.success('Visitor checked in');
  };

  const handleCheckOut = (id: string) => {
    setVisitors(visitors.map(v => 
      v.id === id ? { ...v, status: 'CHECKED_OUT', exitTime: new Date().toISOString() } : v
    ));
    toast.success('Visitor checked out');
  };

  const canApprove = hasRole(['SOCIETY_ADMIN', 'SOCIETY_WORKER', 'SECURITY']);
  const canCheckIn = hasRole(['SOCIETY_ADMIN', 'SOCIETY_WORKER', 'SECURITY']);

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
                <h1 className="text-3xl font-bold">Visitor Management</h1>
                <p className="text-muted-foreground mt-1">
                  Manage visitor entries, approvals, and tracking
                </p>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Visitor
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Visitor</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Visitor Name</Label>
                      <Input placeholder="Enter visitor name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input placeholder="+91 9876543210" />
                    </div>
                    <div className="space-y-2">
                      <Label>Purpose</Label>
                      <Input placeholder="Purpose of visit" />
                    </div>
                    <div className="space-y-2">
                      <Label>Host Apartment</Label>
                      <Input placeholder="A-101" />
                    </div>
                    <Button className="w-full" onClick={() => {
                      toast.success('Visitor added successfully');
                      setIsAddDialogOpen(false);
                    }}>
                      Add Visitor
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Visitors', value: stats.total, icon: Users, color: 'bg-blue-100 text-blue-600' },
              { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
              { label: 'Checked In', value: stats.checkedIn, icon: UserCheck, color: 'bg-green-100 text-green-600' },
              { label: 'Checked Out', value: stats.checkedOut, icon: CheckCircle, color: 'bg-gray-100 text-gray-600' },
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
                    placeholder="Search visitors..."
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

          {/* Visitors List */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as VisitorStatus | 'ALL')}>
            <TabsList className="mb-6">
              <TabsTrigger value="ALL">All</TabsTrigger>
              <TabsTrigger value="PENDING">Pending</TabsTrigger>
              <TabsTrigger value="APPROVED">Approved</TabsTrigger>
              <TabsTrigger value="CHECKED_IN">Checked In</TabsTrigger>
              <TabsTrigger value="CHECKED_OUT">Checked Out</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {filteredVisitors.map((visitor) => (
                  <motion.div
                    key={visitor.id}
                    variants={itemVariants}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{visitor.name}</h3>
                                <Badge variant="outline" className={getStatusBadge(visitor.status)}>
                                  {visitor.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {visitor.phone}
                                </span>
                                {visitor.vehicleNumber && (
                                  <span className="flex items-center gap-1">
                                    <Car className="h-3 w-3" />
                                    {visitor.vehicleNumber}
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Purpose: {visitor.purpose}
                              </p>
                              {visitor.hostName && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Visiting: {visitor.hostName} ({visitor.hostApartment})
                                </p>
                              )}
                              {visitor.entryTime && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Entry: {new Date(visitor.entryTime).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {visitor.status === 'PENDING' && canApprove && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="gap-1 text-green-600"
                                  onClick={() => handleApprove(visitor.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="gap-1 text-red-600"
                                  onClick={() => handleReject(visitor.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {visitor.status === 'APPROVED' && canCheckIn && (
                              <Button 
                                size="sm" 
                                className="gap-1"
                                onClick={() => handleCheckIn(visitor.id)}
                              >
                                <UserCheck className="h-4 w-4" />
                                Check In
                              </Button>
                            )}
                            {visitor.status === 'CHECKED_IN' && canCheckIn && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="gap-1"
                                onClick={() => handleCheckOut(visitor.id)}
                              >
                                <ArrowRight className="h-4 w-4" />
                                Check Out
                              </Button>
                            )}
                            <Button size="sm" variant="ghost">
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {filteredVisitors.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold">No visitors found</h3>
                      <p className="text-muted-foreground">
                        {searchQuery ? 'Try adjusting your search' : 'No visitors in this category'}
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
