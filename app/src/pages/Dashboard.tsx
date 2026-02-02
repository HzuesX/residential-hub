import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  Wrench, 
  Bell, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  ArrowUpRight,
  DollarSign,
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getFullName } from '@/types';
import { Link } from 'react-router-dom';

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

export default function Dashboard() {
  const { user, hasRole, getUserDisplayName } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const statCards = [
    {
      title: 'Total Residents',
      value: '245',
      icon: Users,
      trend: '+5%',
      trendUp: true,
      color: 'from-blue-500 to-cyan-500',
      link: '/admin',
    },
    {
      title: "Today's Visitors",
      value: '18',
      icon: UserCheck,
      trend: '+12%',
      trendUp: true,
      color: 'from-green-500 to-emerald-500',
      link: '/visitors',
    },
    {
      title: 'Pending Maintenance',
      value: '7',
      icon: Wrench,
      trend: '-3%',
      trendUp: false,
      color: 'from-orange-500 to-amber-500',
      link: '/maintenance',
    },
    {
      title: 'Active Announcements',
      value: '3',
      icon: Bell,
      trend: '0%',
      trendUp: true,
      color: 'from-purple-500 to-pink-500',
      link: '/announcements',
    },
  ];

  const quickActions = [
    {
      title: 'Add Visitor',
      description: 'Register new visitor',
      icon: UserCheck,
      color: 'bg-blue-100 text-blue-600',
      link: '/visitors',
    },
    {
      title: 'New Request',
      description: 'Submit maintenance',
      icon: Wrench,
      color: 'bg-orange-100 text-orange-600',
      link: '/maintenance',
    },
    {
      title: 'Community',
      description: 'View social feed',
      icon: Bell,
      color: 'bg-purple-100 text-purple-600',
      link: '/social',
    },
    {
      title: 'Payments',
      description: 'View dues & pay',
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
      link: '/payments',
    },
  ];

  const recentActivities = [
    { id: 1, text: 'New visitor registered', time: '5 min ago', icon: UserCheck, color: 'bg-blue-100 text-blue-600' },
    { id: 2, text: 'Maintenance request #123 updated', time: '1 hour ago', icon: Wrench, color: 'bg-orange-100 text-orange-600' },
    { id: 3, text: 'New announcement posted', time: '2 hours ago', icon: Bell, color: 'bg-purple-100 text-purple-600' },
    { id: 4, text: 'Payment received', time: '3 hours ago', icon: DollarSign, color: 'bg-green-100 text-green-600' },
  ];

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {getUserDisplayName()}! Here's what's happening in your community.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {statCards.map((stat) => (
              <motion.div key={stat.title} variants={itemVariants}>
                <Link to={stat.link}>
                  <Card className="hover:shadow-3d transition-all duration-300 group cursor-pointer overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                          <p className="text-3xl font-bold">{stat.value}</p>
                          <div className="flex items-center gap-1 mt-2">
                            {stat.trendUp ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className={stat.trendUp ? 'text-green-500 text-sm' : 'text-red-500 text-sm'}>
                              {stat.trend}
                            </span>
                            <span className="text-muted-foreground text-sm">vs last month</span>
                          </div>
                        </div>
                        <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2"
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks at your fingertips</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                      <Link
                        key={action.title}
                        to={action.link}
                        className="flex flex-col items-center gap-3 p-4 rounded-xl border hover:bg-muted/50 hover:shadow-md transition-all group"
                      >
                        <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <action.icon className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-sm">{action.title}</p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates from your community</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`w-8 h-8 ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <activity.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.text}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Visitor Status */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Visitor Status
                      </CardTitle>
                      <CardDescription>Current visitor statistics</CardDescription>
                    </div>
                    <Link to="/visitors">
                      <Button variant="ghost" size="sm" className="gap-1">
                        View All
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Pending Approval', value: 3, color: 'bg-yellow-100 text-yellow-800' },
                      { label: 'Approved', value: 8, color: 'bg-green-100 text-green-800' },
                      { label: 'Checked In', value: 5, color: 'bg-blue-100 text-blue-800' },
                      { label: 'Checked Out', value: 12, color: 'bg-gray-100 text-gray-800' },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className={`font-semibold px-3 py-1 rounded-full text-sm ${item.color}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Maintenance Overview */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Maintenance Overview
                      </CardTitle>
                      <CardDescription>Current maintenance status</CardDescription>
                    </div>
                    <Link to="/maintenance">
                      <Button variant="ghost" size="sm" className="gap-1">
                        View All
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Pending', value: 4, color: 'bg-yellow-100 text-yellow-800' },
                      { label: 'In Progress', value: 2, color: 'bg-blue-100 text-blue-800' },
                      { label: 'Completed', value: 15, color: 'bg-green-100 text-green-800' },
                      { label: 'Urgent', value: 1, color: 'bg-red-100 text-red-800' },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className={`font-semibold px-3 py-1 rounded-full text-sm ${item.color}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Payment Summary (Admin Only) */}
          {hasRole(['PROJECT_OWNER', 'SOCIETY_ADMIN']) && (
            <motion.div variants={itemVariants} className="mt-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Payment Summary
                      </CardTitle>
                      <CardDescription>Financial overview for this month</CardDescription>
                    </div>
                    <Link to="/payments">
                      <Button variant="ghost" size="sm" className="gap-1">
                        View All
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Total Collected</p>
                      <p className="text-2xl font-bold text-green-600">$32,450</p>
                      <p className="text-sm text-green-600 mt-1">+8% from last month</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">$8,230</p>
                      <p className="text-sm text-yellow-600 mt-1">12 pending payments</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Overdue</p>
                      <p className="text-2xl font-bold text-red-600">$2,150</p>
                      <p className="text-sm text-red-600 mt-1">5 overdue payments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
