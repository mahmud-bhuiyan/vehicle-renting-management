export interface RentBookingView {
  customerName: string;
  customerCity?: string;
  mobileNo?: string;
  email: string;
  bookingId?: number;
  carId: number;
  bookingDate: string;
  discount?: number;
  totalBillAmount: number;
}
