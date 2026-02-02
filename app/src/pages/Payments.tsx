import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Download,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  FileText
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
import type { Payment, PaymentStatus, PaymentType } from '@/types';

const mockPayments: Payment[] = [
  {
    id: '1',
    userId: '1',
    societyId: '1',
    amount: 2500,
    type: 'MAINTENANCE',
    status: 'PAID',
    description: 'Monthly maintenance fee - January 2024',
    dueDate: '2024-01-31',
    paidAt: '2024-01-15',
    transactionId: 'TXN001234',
    paymentMethod: 'Credit Card',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    userId: '1',
    societyId: '1',
    amount: 800,
    type: 'WATER',
    status: 'PENDING',
    description: 'Water bill - January 2024',
    dueDate: '2024-01-31',
    createdAt: '2024-01-01',
  },
  {
    id: '3',
    userId: '1',
    societyId: '1',
    amount: 1500,
    type: 'ELECTRICITY',
    status: 'OVERDUE',
    description: 'Electricity bill - December 2023',
    dueDate: '2023-12-31',
    createdAt: '2023-12-01',
  },
  {
    id: '4',
    userId: '1',
    societyId: '1',
    amount: 500,
    type: 'PARKING',
    status: 'PAID',
    description: 'Parking fee - January 2024',
    dueDate: '2024-01-31',
    paidAt: '2024-01-10',
    transactionId: 'TXN001235',
    paymentMethod: 'UPI',
    createdAt: '2024-01-01',
  },
];

const getStatusBadge = (status: PaymentStatus) => {
  const styles: Record<PaymentStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PAID: 'bg-green-100 text-green-800 border-green-200',
    OVERDUE: 'bg-red-100 text-red-800 border-red-200',
    CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return styles[status] || styles.PENDING;
};

const getTypeIcon = (type: PaymentType) => {
  const icons: Record<PaymentType, typeof DollarSign> = {
    MAINTENANCE: CreditCard,
    WATER: DollarSign,
    ELECTRICITY: DollarSign,
    PARKING: DollarSign,
    EVENT: Calendar,
    OTHER: DollarSign,
  };
  return icons[type] || DollarSign;
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

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<PaymentStatus | 'ALL'>('ALL');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeTab === 'ALL' || p.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalDue: payments.filter(p => p.status === 'PENDING' || p.status === 'OVERDUE')
      .reduce((sum, p) => sum + p.amount, 0),
    totalPaid: payments.filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter(p => p.status === 'PENDING').length,
    overdue: payments.filter(p => p.status === 'OVERDUE').length,
  };

  const handlePay = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPaymentDialogOpen(true);
  };

  const processPayment = () => {
    if (selectedPayment) {
      setPayments(payments.map(p => 
        p.id === selectedPayment.id 
          ? { ...p, status: 'PAID', paidAt: new Date().toISOString(), transactionId: `TXN${Date.now()}` }
          : p
      ));
      toast.success('Payment successful!');
      setIsPaymentDialogOpen(false);
      setSelectedPayment(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
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
            <h1 className="text-3xl font-bold">Payments & Billing</h1>
            <p className="text-muted-foreground mt-1">
              Manage your payments and view billing history
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Due', value: formatCurrency(stats.totalDue), icon: AlertCircle, color: 'bg-red-100 text-red-600' },
              { label: 'Total Paid', value: formatCurrency(stats.totalPaid), icon: CheckCircle, color: 'bg-green-100 text-green-600' },
              { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
              { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'bg-red-100 text-red-600' },
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

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payments List */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PaymentStatus | 'ALL')}>
            <TabsList className="mb-6">
              <TabsTrigger value="ALL">All</TabsTrigger>
              <TabsTrigger value="PENDING">Pending</TabsTrigger>
              <TabsTrigger value="PAID">Paid</TabsTrigger>
              <TabsTrigger value="OVERDUE">Overdue</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {filteredPayments.map((payment) => {
                  const Icon = getTypeIcon(payment.type);
                  return (
                    <motion.div
                      key={payment.id}
                      variants={itemVariants}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Icon className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{payment.description}</h3>
                                  <Badge variant="outline" className={getStatusBadge(payment.status)}>
                                    {payment.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Due: {new Date(payment.dueDate).toLocaleDateString()}
                                  </span>
                                  <span className="px-2 py-0.5 bg-muted rounded text-xs">
                                    {payment.type}
                                  </span>
                                </p>
                                {payment.paidAt && (
                                  <p className="text-sm text-green-600 mt-1">
                                    Paid on {new Date(payment.paidAt).toLocaleDateString()}
                                    {payment.transactionId && ` • ${payment.transactionId}`}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <p className="text-2xl font-bold">{formatCurrency(payment.amount)}</p>
                              {(payment.status === 'PENDING' || payment.status === 'OVERDUE') && (
                                <Button size="sm" onClick={() => handlePay(payment)}>
                                  Pay Now
                                </Button>
                              )}
                              {payment.status === 'PAID' && (
                                <Button size="sm" variant="outline" className="gap-1">
                                  <FileText className="h-4 w-4" />
                                  Receipt
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}

                {filteredPayments.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold">No payments found</h3>
                      <p className="text-muted-foreground">
                        {searchQuery ? 'Try adjusting your search' : 'No payments in this category'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Amount to Pay</p>
                <p className="text-3xl font-bold">{formatCurrency(selectedPayment.amount)}</p>
                <p className="text-sm mt-1">{selectedPayment.description}</p>
              </div>
              <div className="space-y-2">
                <Label>Select Payment Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="justify-start gap-2">
                    <CreditCard className="h-4 w-4" />
                    Credit Card
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <DollarSign className="h-4 w-4" />
                    UPI
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    Net Banking
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <Calendar className="h-4 w-4" />
                    Wallet
                  </Button>
                </div>
              </div>
              <Button className="w-full" onClick={processPayment}>
                Pay {formatCurrency(selectedPayment.amount)}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
