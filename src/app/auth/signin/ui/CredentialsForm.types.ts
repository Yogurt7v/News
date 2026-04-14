export interface CredentialsFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  isNavigating?: boolean;
  error: string;
  onBack: () => void;
}
