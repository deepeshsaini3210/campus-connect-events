export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  };
  message: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber?: string;
  profileImage?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
  college?: College;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface College {
  id: string;
  name: string;
  code: string;
  type: string;
  address: string;
  city: string;
  state: string;
  country: string;
  website?: string;
  logo?: string;
  isActive: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  organizer: User;
  college: College;
  startDate: string;
  endDate: string;
  location: string;
  maxAttendees?: number;
  currentAttendees: number;
  price: number;
  currency: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  imageUrl?: string;
  tags: string[];
  highlights: EventHighlight[];
  createdAt: string;
  updatedAt: string;
}

export interface EventCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
}

export interface EventHighlight {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  order: number;
}

export interface Booking {
  id: string;
  user: User;
  event: Event;
  bookingReference: string;
  qrCodeUrl?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'ATTENDED';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  amount: number;
  currency: string;
  bookedAt: string;
  cancelledAt?: string;
  attendedAt?: string;
}

export interface Collaboration {
  id: string;
  requesterCollege: College;
  partnerCollege: College;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  requestedAt: string;
  respondedAt?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  user: User;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
}
