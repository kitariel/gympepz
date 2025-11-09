// Shared menu types for sidebar components

export type MenuChild = {
  title: string;
  url: string;
};

export type MenuItem = {
  title: string;
  url: string;
  isActive?: boolean;
  items?: MenuChild[];
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