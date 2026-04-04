export interface ParserLogProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  currentLog: string;
}
