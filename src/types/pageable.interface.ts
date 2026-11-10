export interface PaginationParams {
  query?: string;
  page?: number;     // 1-indexed (Page 1, Page 2, etc.)
  pageSize?: number; // How many items per page
}

export interface PaginationResult<T> {
  data: T[];
  page: number;      // Current page number
  pageSize: number;  // Number of items per page
  totalPages: number; // Total number of pages available
  totalItems: number; // Total number of items available
}