export interface OAuthButtonProps {
  provider: 'google' | 'yandex' | 'github';
  onClick: () => void;
  isLoading: boolean;
}
