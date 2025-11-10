// Shared menu types for sidebar components

export type Role = string; // placeholder type; integrate with account system later

export type MenuChild = {
  title: string;
  url: string;
  // Optional roles that can view this child item
  roles?: Role[];
  // Whether this child is enabled/visible for non-admin views
  enabled?: boolean;
};

export type IconPlatform = "lucide" | "heroicons";

export type MenuItem = {
  title: string;
  url: string;
  isActive?: boolean;
  items?: MenuChild[];
  // Optional icon name for this parent item
  iconName?: string;
  // Optional icon platform (lucide or heroicons)
  iconPlatform?: IconPlatform;
  // Optional roles that can view this parent item
  roles?: Role[];
  // Whether this parent is enabled/visible for non-admin views
  enabled?: boolean;
};

export type SecondaryItem = {
  title: string;
  url: string;
};

export type ProjectItem = {
  name: string;
  url: string;
};

export type MenuConfig = {
  navMain: MenuItem[];
  navSecondary: SecondaryItem[];
  projects: ProjectItem[];
};

export type MenuCreateType = "group" | "single";