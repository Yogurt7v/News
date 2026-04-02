import { ReactNode } from 'react';
import { SectionHeader } from './SectionHeader';
import { SectionDivider } from './SectionDivider';

interface SidebarSectionProps {
  title: string;
  action?: { label: string; onClick: () => void };
  showDivider?: boolean;
  children: ReactNode;
}

export function SidebarSection({
  title,
  action,
  showDivider = false,
  children,
}: SidebarSectionProps) {
  return (
    <>
      {showDivider && <SectionDivider />}
      <SectionHeader title={title} action={action} />
      {children}
    </>
  );
}
