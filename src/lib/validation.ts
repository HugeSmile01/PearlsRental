import { ApiError } from '@/lib/response';
import { RentalStatusValue, ProductStatusValue } from '@/lib/rental-state';

type RegisterInput = { name: string; email: string; password: string };
type RentalCreateInput = { productId: string; startDate: string; endDate: string; notes?: string };
type RentalUpdateInput = { status: RentalStatusValue };

type ProductWriteInput = {
  name: string;
  description: string;
  category: string;
  size: string;
  color: string;
  fabric: string;
  occasion: string;
  images: string[];
  pricePerDay: number;
  tags: string[];
  status?: ProductStatusValue;
};

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const isIsoDate = (value: string) => !Number.isNaN(new Date(value).getTime());
const rentalStatuses: RentalStatusValue[] = ['RESERVED_UNPAID', 'PICKED_UP_PAID', 'RETURNED', 'OVERDUE', 'CANCELLED', 'EXPIRED'];
const productStatuses: ProductStatusValue[] = ['AVAILABLE', 'RESERVED', 'RENTED', 'MAINTENANCE'];

export function parseRegister(payload: unknown): RegisterInput {
  const p = payload as Partial<RegisterInput>;
  if (!isNonEmptyString(p.name) || p.name.length < 2 || p.name.length > 80) throw new ApiError(400, 'Invalid name');
  if (!isNonEmptyString(p.email) || p.email.length > 180 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) throw new ApiError(400, 'Invalid email');
  if (!isNonEmptyString(p.password) || p.password.length < 8 || p.password.length > 100) throw new ApiError(400, 'Invalid password');

  return { name: p.name.trim(), email: p.email.trim().toLowerCase(), password: p.password };
}

export function parseRentalCreate(payload: unknown): RentalCreateInput {
  const p = payload as Partial<RentalCreateInput>;
  if (!isNonEmptyString(p.productId)) throw new ApiError(400, 'Invalid productId');
  if (!isNonEmptyString(p.startDate) || !isIsoDate(p.startDate)) throw new ApiError(400, 'Invalid startDate');
  if (!isNonEmptyString(p.endDate) || !isIsoDate(p.endDate)) throw new ApiError(400, 'Invalid endDate');
  if (typeof p.notes !== 'undefined' && (typeof p.notes !== 'string' || p.notes.length > 500)) throw new ApiError(400, 'Invalid notes');

  return { productId: p.productId, startDate: p.startDate, endDate: p.endDate, notes: p.notes };
}

export function parseRentalUpdate(payload: unknown): RentalUpdateInput {
  const p = payload as Partial<RentalUpdateInput>;
  if (!p.status || !rentalStatuses.includes(p.status)) throw new ApiError(400, 'Invalid status');
  return { status: p.status };
}

export function parseProductWrite(payload: unknown): ProductWriteInput {
  const p = payload as Partial<ProductWriteInput>;
  const requiredStrings: (keyof Omit<ProductWriteInput, 'images' | 'tags' | 'pricePerDay' | 'status'>)[] = ['name', 'description', 'category', 'size', 'color', 'fabric', 'occasion'];

  for (const key of requiredStrings) {
    if (!isNonEmptyString(p[key])) throw new ApiError(400, `Invalid ${key}`);
  }

  if (!Array.isArray(p.images) || p.images.length < 1 || p.images.length > 12 || p.images.some((i) => typeof i !== 'string' || !i.startsWith('http'))) {
    throw new ApiError(400, 'Invalid images');
  }

  if (!Array.isArray(p.tags) || p.tags.length > 20 || p.tags.some((t) => !isNonEmptyString(t))) throw new ApiError(400, 'Invalid tags');

  if (typeof p.pricePerDay !== 'number' || Number.isNaN(p.pricePerDay) || p.pricePerDay <= 0 || p.pricePerDay > 100000) {
    throw new ApiError(400, 'Invalid pricePerDay');
  }

  if (p.status && !productStatuses.includes(p.status)) throw new ApiError(400, 'Invalid status');

  return {
    name: p.name!.trim(),
    description: p.description!.trim(),
    category: p.category!.trim(),
    size: p.size!.trim(),
    color: p.color!.trim(),
    fabric: p.fabric!.trim(),
    occasion: p.occasion!.trim(),
    images: p.images,
    pricePerDay: p.pricePerDay,
    tags: p.tags.map((t) => t.trim()),
    status: p.status,
  };
}
