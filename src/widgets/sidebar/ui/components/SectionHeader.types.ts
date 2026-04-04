export interface SectionHeaderProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
