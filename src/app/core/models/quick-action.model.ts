export interface QuickAction {
  label: string;
  icon: string;
  route: string;
  permissions?: string[];
  roles?: string[];
}