import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building, 
  Settings, 
  CreditCard, 
  BarChart3,
  Shield,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { getFullName, roleDisplayNames, type User, type Society } from '@/types';
import { toast } from 'sonner';

const mockUsers: User[] = [
  {
    id: '1',
    userId: 'A1B2C3D',
    username: 'john_doe',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+91 9876543210',
    role: 'RESIDENT',
    apartmentNumber: 'A-101',
    buildingName: 'Tower A',
    societyId: '1',
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    permissions: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'E4F5G6H',
    username: 'jane_smith',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+91 9876543211',
    role: 'SOCIETY_ADMIN',
    apartmentNumber: 'B-202',
    buildingName: 'Tower B',
    societyId: '1',
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    permissions: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: 'I7J8K9L',
    username: 'mike_worker',
    email: 'mike@example.com',
    firstName: 'Mike',
    lastName: 'Worker',
    phone: '+91 9876543212',
    role: 'SOCIETY_WORKER',
    apartmentNumber: 'C-303',
    buildingName: 'Tower C',
    societyId: '1',
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    permissions: [],
    createdAt: new Date().toISOString(),
  },
];

const mockSocieties: Society[] = [
  {
    id: '1',
    name: 'Sunshine Residency',
    address: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    totalBuildings: 5,
    totalApartments: 250,
    subscriptionPlan: 'PREMIUM',
    subscriptionStatus: 'ACTIVE',
    isActive: true,
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Green Valley Apartments',
    address: '456 Park Avenue',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    totalBuildings: 3,
    totalApartments: 150,
    subscriptionPlan: 'STANDARD',
    subscriptionStatus: 'ACTIVE',
    isActive: true,
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
];

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'PROJECT_OWNER':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'SOCIETY_ADMIN':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'SOCIETY_WORKER':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'RESIDENT':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'SECURITY':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
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

export default function AdminPanel() {
  const { user, hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [societies, setSocieties] = useState<Society[]>(mockSocieties);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  const isProjectOwner = hasRole(['PROJECT_OWNER']);

  const filteredUsers = users.filter(u => 
    getFullName(u).toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditUser = (userId: string) => {
    toast.info('Edit user functionality would open a modal');
  };

  const handleDeleteUser = (userId: string) => {
    toast.info('Delete user functionality would show a confirmation dialog');
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ));
    toast.success('User status updated');
  };

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
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">
              Manage users, societies, and platform settings
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto lg:inline-flex">
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              {isProjectOwner && (
                <TabsTrigger value="societies" className="gap-2">
                  <Building className="h-4 w-4" />
                  Societies
                </TabsTrigger>
              )}
              <TabsTrigger value="billing" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage society members and their roles</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add User
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-3"
                  >
                    {filteredUsers.map((u) => (
                      <motion.div
                        key={u.id}
                        variants={itemVariants}
                        className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                            <AvatarImage src={u.profilePhotoUrl} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{getFullName(u)}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={getRoleBadgeColor(u.role)}>
                                {roleDisplayNames[u.role]}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {u.apartmentNumber} • {u.buildingName}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={u.isActive ? 'default' : 'secondary'} className="hidden sm:inline-flex">
                            {u.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUser(u.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleUserStatus(u.id)}>
                                {u.isActive ? (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteUser(u.id)} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    ))}
                    
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">No users found</h3>
                        <p className="text-muted-foreground">Try adjusting your search</p>
                      </div>
                    )}
                  </motion.div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Societies Tab */}
            {isProjectOwner && (
              <TabsContent value="societies">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Society Management</CardTitle>
                        <CardDescription>Manage registered societies</CardDescription>
                      </div>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Society
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      {societies.map((society) => (
                        <motion.div
                          key={society.id}
                          variants={itemVariants}
                          className="p-4 border rounded-xl hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Building className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{society.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {society.address}, {society.city}, {society.state}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <span className="flex items-center gap-1">
                                    <Building className="h-3 w-3" />
                                    {society.totalBuildings} Buildings
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {society.totalApartments} Apartments
                                  </span>
                                  <Badge className={society.subscriptionStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                    {society.subscriptionPlan}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={society.isActive ? 'default' : 'secondary'}>
                                {society.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Billing Tab */}
            <TabsContent value="billing">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card className="hover:shadow-3d transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold">$45,230</p>
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      +12% this month
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-3d transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold">48</p>
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      +3 new this month
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-3d transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-muted-foreground">Trial Societies</p>
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold">12</p>
                    <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      5 expiring soon
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest payment activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Premium Plan - Sunshine Residency</p>
                            <p className="text-sm text-muted-foreground">Transaction ID: TXN{i}23456</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">$299.00</p>
                          <p className="text-sm text-muted-foreground">{i} hours ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="hover:shadow-3d transition-shadow">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">Total Users</p>
                    <p className="text-3xl font-bold">12,450</p>
                    <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                      <BarChart3 className="h-3 w-3" />
                      +8% this week
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-3d transition-shadow">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">Active Societies</p>
                    <p className="text-3xl font-bold">60</p>
                    <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                      <BarChart3 className="h-3 w-3" />
                      +3 this month
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-3d transition-shadow">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">Visitors Today</p>
                    <p className="text-3xl font-bold">1,234</p>
                    <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                      <BarChart3 className="h-3 w-3" />
                      +15% vs yesterday
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-3d transition-shadow">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">Maintenance Requests</p>
                    <p className="text-3xl font-bold">89</p>
                    <div className="flex items-center gap-1 text-orange-600 text-sm mt-1">
                      <BarChart3 className="h-3 w-3" />
                      12 pending
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Platform Growth</CardTitle>
                  <CardDescription>User and society growth over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-4">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
                      <div key={month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex gap-1">
                          <div
                            className="flex-1 bg-primary/30 rounded-t-lg"
                            style={{ height: `${(i + 1) * 30}px` }}
                          />
                          <div
                            className="flex-1 bg-primary rounded-t-lg"
                            style={{ height: `${(i + 1) * 40}px` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{month}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
