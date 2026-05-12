export type RentalStatusValue = 'RESERVED_UNPAID' | 'PICKED_UP_PAID' | 'RETURNED' | 'OVERDUE' | 'CANCELLED' | 'EXPIRED';
export type ProductStatusValue = 'AVAILABLE' | 'RESERVED' | 'RENTED' | 'MAINTENANCE';

const transitions: Record<RentalStatusValue, RentalStatusValue[]> = {
  RESERVED_UNPAID: ['PICKED_UP_PAID', 'CANCELLED', 'EXPIRED'],
  PICKED_UP_PAID: ['RETURNED', 'OVERDUE'],
  OVERDUE: ['RETURNED'],
  RETURNED: [],
  CANCELLED: [],
  EXPIRED: [],
};
export function canTransitionRentalStatus(from: string, to: string) {
  if (!from || !to) return false;
  if (!(from in transitions)) return false;
  return from === to || (transitions as any)[from].includes(to);
}

export function deriveProductStatusFromRental(rentalStatus: string): ProductStatusValue {
  switch (rentalStatus) {
    case 'PICKED_UP_PAID':
    case 'OVERDUE':
      return 'RENTED';
    case 'RESERVED_UNPAID':
      return 'RESERVED';
    case 'RETURNED':
    case 'CANCELLED':
    case 'EXPIRED':
      return 'AVAILABLE';
    default:
      return 'AVAILABLE';
  }
}
