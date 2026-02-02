import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Search, 
  Filter,
  Calendar,
  User,
  Clock,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  LogIn,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { AuditLog } from '@/types';

const mockLogs: AuditLog[] = [
  {
    id: '1',
    userId: '1',
    username: 'john_doe',
    action: 'LOGIN',
    entityType: 'USER',
    entityId: '1',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    societyId: '1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: '1',
    username: 'john_doe',
    action: 'CREATE',
    entityType: 'VISITOR',
    entityId: '123',
    newValue: '{"name": "Rahul Sharma", "phone": "9876543210"}',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    societyId: '1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    userId: '2',
    username: 'jane_smith',
    action: 'UPDATE',
    entityType: 'MAINTENANCE',
    entityId: '456',
    oldValue: '{"status": "PENDING"}',
    newValue: '{"status": "ASSIGNED", "assignedTo": "3"}',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    societyId: '1',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '4',
    userId: '3',
    username: 'mike_worker',
    action: 'APPROVE',
    entityType: 'VISITOR',
    entityId: '789',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    societyId: '1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '5',
    userId: '1',
    username: 'john_doe',
    action: 'LOGOUT',
    entityType: 'USER',
    entityId: '1',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    societyId: '1',
    createdAt: new Date(Date.now() - 90000000).toISOString(),
  },
];

const getActionIcon = (action: string) => {
  const icons: Record<string, typeof Eye> = {
    LOGIN: LogIn,
    LOGOUT: LogOut,
    CREATE: Plus,
    READ: Eye,
    UPDATE: Edit,
    DELETE: Trash2,
    APPROVE: Shield,
    REJECT: Shield,
  };
  return icons[action] || FileText;
};

const getActionColor = (action: string) => {
  const colors: Record<string, string> = {
    LOGIN: 'bg-green-100 text-green-800',
    LOGOUT: 'bg-gray-100 text-gray-800',
    CREATE: 'bg-blue-100 text-blue-800',
    READ: 'bg-purple-100 text-purple-800',
    UPDATE: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800',
    APPROVE: 'bg-green-100 text-green-800',
    REJECT: 'bg-red-100 text-red-800',
  };
  return colors[action] || 'bg-gray-100 text-gray-800';
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

export default function AuditLogs() {
  const { hasRole } = useAuth();
  const [logs] = useState<AuditLog[]>(mockLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleExport = () => {
    toast.success('Audit logs exported successfully');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Audit Logs</h1>
                <p className="text-muted-foreground mt-1">
                  Track all user activities and system changes
                </p>
              </div>
              <Button variant="outline" className="gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export Logs
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Actions</SelectItem>
                    <SelectItem value="LOGIN">Login</SelectItem>
                    <SelectItem value="LOGOUT">Logout</SelectItem>
                    <SelectItem value="CREATE">Create</SelectItem>
                    <SelectItem value="READ">Read</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="DELETE">Delete</SelectItem>
                    <SelectItem value="APPROVE">Approve</SelectItem>
                    <SelectItem value="REJECT">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Logs List */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {filteredLogs.map((log) => {
              const Icon = getActionIcon(log.action);
              return (
                <motion.div
                  key={log.id}
                  variants={itemVariants}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 ${getActionColor(log.action)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{log.username}</span>
                              <Badge variant="outline" className={getActionColor(log.action)}>
                                {log.action}
                              </Badge>
                              <span className="text-muted-foreground">{log.entityType}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                User ID: {log.userId}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Entity: {log.entityId}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatTime(log.createdAt)}
                              </span>
                            </div>
                            {log.oldValue && (
                              <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                                <span className="text-red-500">- {log.oldValue}</span>
                              </div>
                            )}
                            {log.newValue && (
                              <div className="mt-1 p-2 bg-muted rounded text-xs font-mono">
                                <span className="text-green-500">+ {log.newValue}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{log.ipAddress}</p>
                          <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                            {log.userAgent.split(' ')[0]}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {filteredLogs.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No logs found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'Try adjusting your search' : 'No audit logs available'}
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
