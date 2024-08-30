interface ErrorWithMessage {
  message: string;
}

export const errorHasMessage = (error: unknown) => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ErrorWithMessage).message === 'string'
  );
}