export interface ChannelSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isLoading: boolean;
}
