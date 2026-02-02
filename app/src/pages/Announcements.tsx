import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  User,
  Megaphone,
  AlertTriangle,
  Wrench,
  PartyPopper,
  Shield,
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
import type { Announcement, AnnouncementCategory, Priority } from '@/types';

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Annual General Meeting',
    content: 'The Annual General Meeting for all residents will be held on January 15th at 6 PM in the community hall. All residents are requested to attend.',
    category: 'GENERAL',
    priority: 'HIGH',
    postedBy: '1',
    postedByName: 'Admin',
    targetAudience: ['RESIDENT', 'SOCIETY_ADMIN'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attachments: [],
    societyId: '1',
  },
  {
    id: '2',
    title: 'Water Supply Interruption',
    content: 'Due to maintenance work, water supply will be interrupted tomorrow from 10 AM to 2 PM. Please store sufficient water in advance.',
    category: 'MAINTENANCE',
    priority: 'URGENT',
    postedBy: '1',
    postedByName: 'Admin',
    targetAudience: ['RESIDENT', 'SOCIETY_ADMIN', 'SOCIETY_WORKER'],
    isActive: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    attachments: [],
    societyId: '1',
  },
  {
    id: '3',
    title: 'New Year Celebration',
    content: 'Join us for the New Year celebration on December 31st at the clubhouse. Dinner and entertainment will be provided.',
    category: 'EVENT',
    priority: 'MEDIUM',
    postedBy: '2',
    postedByName: 'Jane Smith',
    targetAudience: ['RESIDENT'],
    isActive: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    attachments: [],
    societyId: '1',
  },
];

const getCategoryIcon = (category: AnnouncementCategory) => {
  const icons: Record<AnnouncementCategory, typeof Bell> = {
    GENERAL: Megaphone,
    MAINTENANCE: Wrench,
    SECURITY: Shield,
    EVENT: PartyPopper,
    EMERGENCY: AlertTriangle,
  };
  return icons[category] || Bell;
};

const getCategoryColor = (category: AnnouncementCategory) => {
  const colors: Record<AnnouncementCategory, string> = {
    GENERAL: 'bg-blue-100 text-blue-800',
    MAINTENANCE: 'bg-orange-100 text-orange-800',
    SECURITY: 'bg-red-100 text-red-800',
    EVENT: 'bg-green-100 text-green-800',
    EMERGENCY: 'bg-red-100 text-red-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

const getPriorityBadge = (priority: Priority) => {
  const styles: Record<Priority, string> = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
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

export default function Announcements() {
  const { user, hasRole } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<AnnouncementCategory | 'ALL'>('ALL');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.postedByName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === 'ALL' || a.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  const canCreate = hasRole(['SOCIETY_ADMIN', 'SOCIETY_WORKER']);

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
                <h1 className="text-3xl font-bold">Announcements</h1>
                <p className="text-muted-foreground mt-1">
                  Stay updated with community news and notices
                </p>
              </div>
              {canCreate && (
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      New Announcement
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create Announcement</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input placeholder="Announcement title" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GENERAL">General</SelectItem>
                              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                              <SelectItem value="SECURITY">Security</SelectItem>
                              <SelectItem value="EVENT">Event</SelectItem>
                              <SelectItem value="EMERGENCY">Emergency</SelectItem>
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
                      </div>
                      <div className="space-y-2">
                        <Label>Content</Label>
                        <Textarea placeholder="Announcement content..." rows={4} />
                      </div>
                      <Button className="w-full" onClick={() => {
                        toast.success('Announcement created');
                        setIsAddDialogOpen(false);
                      }}>
                        Post Announcement
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search announcements..."
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

          {/* Announcements List */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AnnouncementCategory | 'ALL')}>
            <TabsList className="mb-6 flex-wrap">
              <TabsTrigger value="ALL">All</TabsTrigger>
              <TabsTrigger value="GENERAL">General</TabsTrigger>
              <TabsTrigger value="MAINTENANCE">Maintenance</TabsTrigger>
              <TabsTrigger value="SECURITY">Security</TabsTrigger>
              <TabsTrigger value="EVENT">Events</TabsTrigger>
              <TabsTrigger value="EMERGENCY">Emergency</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {filteredAnnouncements.map((announcement) => {
                  const Icon = getCategoryIcon(announcement.category);
                  return (
                    <motion.div
                      key={announcement.id}
                      variants={itemVariants}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 ${getCategoryColor(announcement.category)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{announcement.title}</h3>
                                <Badge className={getPriorityBadge(announcement.priority)}>
                                  {announcement.priority}
                                </Badge>
                                <Badge variant="outline" className={getCategoryColor(announcement.category)}>
                                  {announcement.category}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground mb-3">
                                {announcement.content}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  Posted by {announcement.postedByName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(announcement.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}

                {filteredAnnouncements.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold">No announcements found</h3>
                      <p className="text-muted-foreground">
                        {searchQuery ? 'Try adjusting your search' : 'No announcements in this category'}
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
