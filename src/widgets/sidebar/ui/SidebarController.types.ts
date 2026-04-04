export interface SidebarControllerProps {
  isOpen: boolean;
  isScrollingDown: boolean;
  children: React.ReactNode;
  onMenuClick: () => void;
  onClose: () => void;
}
