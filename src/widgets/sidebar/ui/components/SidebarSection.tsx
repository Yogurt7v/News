import type { SidebarSectionProps } from './SidebarSection.types';
import { SectionHeader } from './SectionHeader';
import { SectionDivider } from './SectionDivider';

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
