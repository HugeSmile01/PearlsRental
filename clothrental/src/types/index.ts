export type ProductStatus = 'AVAILABLE' | 'RESERVED' | 'RENTED' | 'MAINTENANCE';
export type RentalStatus = 'RESERVED_UNPAID' | 'PICKED_UP_PAID' | 'RETURNED' | 'OVERDUE' | 'CANCELLED' | 'EXPIRED';
export type UserRole = 'USER' | 'ADMIN';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  size: string;
  color: string;
  fabric: string;
  occasion: string;
  images: string[];
  pricePerDay: number;
  status: ProductStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Rental {
  id: string;
  userId: string;
  productId: string;
  startDate: string;
  endDate: string;
  status: RentalStatus;
  notes?: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  user?: User;
  product?: Product;
}

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  notes?: string;
  openingHours: Record<string, string>;
}

export interface FilterState {
  search: string;
  category: string;
  size: string;
  status: string;
  minPrice: number;
  maxPrice: number;
  sortBy: string;
}
