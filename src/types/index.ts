export * from './vehicle';
export * from './booking';
export * from './payment';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
