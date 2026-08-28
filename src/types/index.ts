export * from './vehicle';
export * from './driver';
export * from './booking';
export * from './payment';
export * from './review';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
