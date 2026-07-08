export interface DashboardCard {
  title: string;
  value: string | number;
  description: string;
  icon: string;
  colorClass: string;
  permissions?: string[];
  roles?: string[];
}
