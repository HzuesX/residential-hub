// User Types
export interface User {
  id: string;
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePhotoUrl?: string;
  role: UserRole;
  apartmentNumber?: string;
  buildingName?: string;
  societyId?: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  permissions: string[];
  lastLoginAt?: string;
  createdAt: string;
}

// Helper function to get full name
export const getFullName = (user: Pick<User, 'firstName' | 'lastName'>): string => {
  return `${user.firstName} ${user.lastName}`.trim();
};

export type UserRole = 'PROJECT_OWNER' | 'SOCIETY_ADMIN' | 'SOCIETY_WORKER' | 'RESIDENT' | 'SECURITY';

// Role display names
export const roleDisplayNames: Record<UserRole, string> = {
  PROJECT_OWNER: 'Project Owner',
  SOCIETY_ADMIN: 'Society Admin',
  SOCIETY_WORKER: 'Society Worker',
  RESIDENT: 'Resident',
  SECURITY: 'Security',
};

// Role permissions
export const rolePermissions: Record<UserRole, string[]> = {
  PROJECT_OWNER: ['*'],
  SOCIETY_ADMIN: [
    'users:read', 'users:write',
    'visitors:read', 'visitors:write', 'visitors:approve',
    'maintenance:read', 'maintenance:write', 'maintenance:assign',
    'announcements:read', 'announcements:write',
    'payments:read', 'payments:write',
    'analytics:read',
    'audit:read',
    'social:read', 'social:write',
  ],
  SOCIETY_WORKER: [
    'visitors:read', 'visitors:write', 'visitors:approve',
    'maintenance:read', 'maintenance:write',
    'announcements:read',
    'social:read',
  ],
  RESIDENT: [
    'visitors:read', 'visitors:write',
    'maintenance:read', 'maintenance:write',
    'announcements:read',
    'payments:read', 'payments:write',
    'social:read', 'social:write',
    'messages:read', 'messages:write',
  ],
  SECURITY: [
    'visitors:read', 'visitors:write', 'visitors:checkin', 'visitors:checkout',
    'announcements:read',
  ],
};

export interface UserRegistration {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  apartmentNumber: string;
  buildingName: string;
  societyId: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

// Society Types
export interface Society {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalBuildings: number;
  totalApartments: number;
  subscriptionPlan: string;
  subscriptionStatus: string;
  isActive: boolean;
  isVerified: boolean;
  ownerId?: string;
  createdAt: string;
}

// Visitor Types
export interface Visitor {
  id: string;
  name: string;
  phone: string;
  email?: string;
  purpose: string;
  hostId: string;
  hostName?: string;
  hostApartment?: string;
  entryTime?: string;
  exitTime?: string;
  status: VisitorStatus;
  vehicleNumber?: string;
  photoUrl?: string;
  qrCode?: string;
  societyId: string;
  approvedBy?: string;
  approvedAt?: string;
  checkedInBy?: string;
  checkedOutBy?: string;
  rejectionReason?: string;
  createdAt: string;
}

export type VisitorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHECKED_IN' | 'CHECKED_OUT';

export interface VisitorStats {
  pending: number;
  approved: number;
  checkedIn: number;
  checkedOut: number;
  thisWeek: number;
}

// Maintenance Types
export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: Priority;
  status: MaintenanceStatus;
  requestedBy: string;
  requestedByName?: string;
  apartmentNumber?: string;
  assignedTo?: string;
  assignedToName?: string;
  estimatedCost?: number;
  actualCost?: number;
  completedAt?: string;
  societyId: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export type MaintenanceCategory = 'PLUMBING' | 'ELECTRICAL' | 'CARPENTRY' | 'PAINTING' | 'HVAC' | 'CLEANING' | 'OTHER';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type MaintenanceStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// Announcement Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: Priority;
  postedBy: string;
  postedByName?: string;
  targetAudience: UserRole[];
  isActive: boolean;
  expiresAt?: string;
  attachments: string[];
  societyId: string;
  createdAt: string;
  updatedAt: string;
}

export type AnnouncementCategory = 'GENERAL' | 'MAINTENANCE' | 'SECURITY' | 'EVENT' | 'EMERGENCY';

// Social Types
export interface Post {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoUrl?: string;
  societyId: string;
  images: string[];
  likesCount: number;
  commentsCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string;
  content: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  societyId: string;
  createdAt: string;
}

// Payment Types
export interface Payment {
  id: string;
  userId: string;
  societyId: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  description: string;
  dueDate?: string;
  paidAt?: string;
  transactionId?: string;
  paymentMethod?: string;
  createdAt: string;
}

export type PaymentType = 'MAINTENANCE' | 'WATER' | 'ELECTRICITY' | 'PARKING' | 'EVENT' | 'OTHER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

// Analytics Types
export interface DashboardStats {
  totalResidents: number;
  totalVisitors: number;
  pendingMaintenance: number;
  activeAnnouncements: number;
  visitorStats: {
    today: number;
    week: number;
    month: number;
  };
  maintenanceStats: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  paymentStats: {
    totalCollected: number;
    totalPending: number;
    overdueAmount: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  error?: string;
  errorCode?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Auth Types
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  userAgent: string;
  societyId?: string;
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedId?: string;
  societyId: string;
  createdAt: string;
}

export type NotificationType = 'VISITOR' | 'MAINTENANCE' | 'ANNOUNCEMENT' | 'PAYMENT' | 'SECURITY' | 'GENERAL' | 'SOCIAL';

// Facility Booking Types
export interface FacilityBooking {
  id: string;
  facilityId: string;
  facilityName: string;
  userId: string;
  userName: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendees: number;
  status: BookingStatus;
  societyId: string;
  createdAt: string;
}

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

// Subscription Types
export interface Subscription {
  id: string;
  societyId: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  amount: number;
  autoRenew: boolean;
  createdAt: string;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Filter Types
export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}

export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}
