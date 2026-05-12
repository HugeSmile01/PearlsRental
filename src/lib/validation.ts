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
  const input = payload as Partial<RegisterInput>;
  if (!isNonEmptyString(input.name) || input.name.length < 2 || input.name.length > 80) throw new ApiError(400, 'Invalid name');
  if (!isNonEmptyString(input.email) || input.email.length > 180 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) throw new ApiError(400, 'Invalid email');
  if (!isNonEmptyString(input.password) || input.password.length < 8 || input.password.length > 100) throw new ApiError(400, 'Invalid password');

  return { name: input.name.trim(), email: input.email.trim().toLowerCase(), password: input.password };
}

export function parseRentalCreate(payload: unknown): RentalCreateInput {
  const input = payload as Partial<RentalCreateInput>;
  if (!isNonEmptyString(input.productId)) throw new ApiError(400, 'Invalid productId');
  if (!isNonEmptyString(input.startDate) || !isIsoDate(input.startDate)) throw new ApiError(400, 'Invalid startDate');
  if (!isNonEmptyString(input.endDate) || !isIsoDate(input.endDate)) throw new ApiError(400, 'Invalid endDate');
  if (typeof input.notes !== 'undefined' && (typeof input.notes !== 'string' || input.notes.length > 500)) throw new ApiError(400, 'Invalid notes');

  return { productId: input.productId, startDate: input.startDate, endDate: input.endDate, notes: input.notes };
}

export function parseRentalUpdate(payload: unknown): RentalUpdateInput {
  const input = payload as Partial<RentalUpdateInput>;
  if (!input.status || !rentalStatuses.includes(input.status)) throw new ApiError(400, 'Invalid status');
  return { status: input.status };
}

export function parseProductWrite(payload: unknown): ProductWriteInput {
  const input = payload as Partial<ProductWriteInput>;
  const requiredStrings: (keyof Omit<ProductWriteInput, 'images' | 'tags' | 'pricePerDay' | 'status'>)[] = ['name', 'description', 'category', 'size', 'color', 'fabric', 'occasion'];

  for (const key of requiredStrings) {
    if (!isNonEmptyString(input[key])) throw new ApiError(400, `Invalid ${key}`);
  }

  if (!Array.isArray(input.images) || input.images.length < 1 || input.images.length > 12 || input.images.some((i) => typeof i !== 'string' || !i.startsWith('http'))) {
    throw new ApiError(400, 'Invalid images');
  }

  if (!Array.isArray(input.tags) || input.tags.length > 20 || input.tags.some((t) => !isNonEmptyString(t))) throw new ApiError(400, 'Invalid tags');

  if (typeof input.pricePerDay !== 'number' || Number.isNaN(input.pricePerDay) || input.pricePerDay <= 0 || input.pricePerDay > 100000) {
    throw new ApiError(400, 'Invalid pricePerDay');
  }

  if (input.status && !productStatuses.includes(input.status)) throw new ApiError(400, 'Invalid status');

  return {
    name: input.name!.trim(),
    description: input.description!.trim(),
    category: input.category!.trim(),
    size: input.size!.trim(),
    color: input.color!.trim(),
    fabric: input.fabric!.trim(),
    occasion: input.occasion!.trim(),
    images: input.images,
    pricePerDay: input.pricePerDay,
    tags: input.tags.map((t) => t.trim()),
    status: input.status,
  };
}
