export interface CredentialsFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  error: string;
  onBack: () => void;
}
