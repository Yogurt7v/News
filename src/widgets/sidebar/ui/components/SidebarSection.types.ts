import type { ReactNode } from 'react';

export interface SidebarSectionProps {
  title: string;
  action?: { label: string; onClick: () => void };
  showDivider?: boolean;
  children: ReactNode;
}
