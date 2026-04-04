export interface AppError {
  message: string;
  status?: number;
  data?: Record<string, unknown>;
}

export function isAppError(error: unknown): error is AppError {
  return typeof error === 'object' && error !== null && 'message' in error;
}

export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
}

export function getErrorStatus(error: unknown): number | undefined {
  if (isAppError(error)) {
    return error.status;
  }
  if (error instanceof Error && 'status' in error) {
    return (error as { status: number }).status;
  }
  return undefined;
}
