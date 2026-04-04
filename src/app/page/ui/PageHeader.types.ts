import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  statsText?: string;
  showHint: boolean;
  children?: ReactNode;
}
