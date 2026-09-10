/** Matches the JSON shape returned by CarRentalApp endpoints (camelCase). */
export interface ApiResponse<T = unknown> {
  message?: string;
  result: boolean;
  data?: T;
}
