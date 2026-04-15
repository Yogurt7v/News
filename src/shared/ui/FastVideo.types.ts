export interface FastVideoProps {
  src: string;
  className?: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  lazy?: boolean;
  showDuration?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}
