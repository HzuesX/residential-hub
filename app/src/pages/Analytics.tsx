import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  Wrench,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Analytics() {
  const { hasRole } = useAuth();
  const [timeRange, setTimeRange] = useState('30');

  const stats = [
    {
      title: 'Total Residents',
      value: '245',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: "Today's Visitors",
      value: '18',
      change: '+5%',
      trend: 'up',
      icon: UserCheck,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Maintenance Requests',
      value: '7',
      change: '-8%',
      trend: 'down',
      icon: Wrench,
      color: 'from-orange-500 to-amber-500',
    },
    {
      title: 'Revenue',
      value: '$32,450',
      change: '+15%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const visitorData = [
    { day: 'Mon', visitors: 45 },
    { day: 'Tue', visitors: 52 },
    { day: 'Wed', visitors: 38 },
    { day: 'Thu', visitors: 65 },
    { day: 'Fri', visitors: 48 },
    { day: 'Sat', visitors: 72 },
    { day: 'Sun', visitors: 55 },
  ];

  const maintenanceData = [
    { category: 'Plumbing', count: 12 },
    { category: 'Electrical', count: 8 },
    { category: 'Carpentry', count: 5 },
    { category: 'HVAC', count: 7 },
    { category: 'Painting', count: 3 },
    { category: 'Other', count: 4 },
  ];

  const paymentData = [
    { month: 'Jan', collected: 25000, pending: 5000 },
    { month: 'Feb', collected: 28000, pending: 4500 },
    { month: 'Mar', collected: 32000, pending: 3800 },
    { month: 'Apr', collected: 30000, pending: 4200 },
    { month: 'May', collected: 35000, pending: 3500 },
    { month: 'Jun', collected: 38000, pending: 2800 },
  ];

  const handleExport = () => {
    toast.success('Analytics data exported successfully');
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Insights and statistics for your community
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 3 months</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat) => (
              <motion.div key={stat.title} variants={itemVariants}>
                <Card className="hover:shadow-3d transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                        <div className="flex items-center gap-1 mt-2">
                          {stat.trend === 'up' ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          )}
                          <span className={stat.trend === 'up' ? 'text-green-500 text-sm' : 'text-red-500 text-sm'}>
                            {stat.change}
                          </span>
                          <span className="text-muted-foreground text-sm">vs last period</span>
                        </div>
                      </div>
                      <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visitor Trends */}
            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Visitor Trends</CardTitle>
                      <CardDescription>Daily visitor count</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {visitorData.map((data) => (
                      <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-primary/20 rounded-t-lg relative group"
                          style={{ height: `${(data.visitors / 80) * 200}px` }}
                        >
                          <div
                            className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all group-hover:bg-primary/80"
                            style={{ height: `${(data.visitors / 80) * 100}%` }}
                          />
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {data.visitors}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{data.day}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Maintenance by Category */}
            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Maintenance by Category</CardTitle>
                      <CardDescription>Request distribution</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {maintenanceData.map((item) => (
                      <div key={item.category} className="flex items-center gap-4">
                        <span className="w-24 text-sm">{item.category}</span>
                        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${(item.count / 15) * 100}%` }}
                          />
                        </div>
                        <span className="w-8 text-sm font-medium text-right">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Trends */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Payment Trends</CardTitle>
                      <CardDescription>Monthly collection vs pending</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-4">
                    {paymentData.map((data) => (
                      <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex gap-1">
                          <div
                            className="flex-1 bg-green-500/20 rounded-t-lg relative group"
                            style={{ height: `${(data.collected / 40000) * 200}px` }}
                          >
                            <div
                              className="absolute bottom-0 w-full bg-green-500 rounded-t-lg"
                              style={{ height: '100%' }}
                            />
                          </div>
                          <div
                            className="flex-1 bg-orange-500/20 rounded-t-lg relative group"
                            style={{ height: `${(data.pending / 40000) * 200}px` }}
                          >
                            <div
                              className="absolute bottom-0 w-full bg-orange-500 rounded-t-lg"
                              style={{ height: '100%' }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{data.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded" />
                      <span className="text-sm text-muted-foreground">Collected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded" />
                      <span className="text-sm text-muted-foreground">Pending</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Additional Metrics */}
          <motion.div variants={itemVariants} className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">98.5%</p>
                    <p className="text-muted-foreground mt-1">Visitor Approval Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-500">4.2h</p>
                    <p className="text-muted-foreground mt-1">Avg. Response Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-purple-500">92%</p>
                    <p className="text-muted-foreground mt-1">Resident Satisfaction</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
