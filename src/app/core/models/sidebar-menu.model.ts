export interface SidebarMenuItem {
  label: string;
  icon: string;
  route: string;
  permissions?: string[];
  roles?: string[];
  exact?: boolean;
}