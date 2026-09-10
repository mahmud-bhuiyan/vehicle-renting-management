export interface RentCustomer {
  customerId?: number;
  customerName: string;
  customerCity?: string;
  mobileNo?: string;
  email?: string;
}

export interface CustomerLedgerSummary {
  totalBookings: number;
  totalSpent: number;
  lastBookingDate: string | null;
}
