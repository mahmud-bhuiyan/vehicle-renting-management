export interface ApiResponse<T = unknown> {
  Message?: string;
  Result: boolean;
  Data?: T;
}
