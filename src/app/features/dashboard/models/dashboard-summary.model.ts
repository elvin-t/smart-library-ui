export interface DashboardSummary {
  totalUsers: number;
  totalBooks: number;
  availableBooks: number;
  lowStockBooks: number;

  borrowRecords: number;
  pendingFines: number;
  notifications: number;
}
