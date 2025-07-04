// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
const idError = 'ERROR_CANCELED' as const;

export type TErrorCanceled<T> = {
  basePromise: Promise<T>;
  moduleName?: string;
  id: typeof idError;
  name: 'Canceled';
  message: 'Promise is canceled';
};

export const createErrorCanceled = <T>(
  basePromise: Promise<T>,
  moduleName = '',
): TErrorCanceled<T> => {
  return {
    basePromise,
    moduleName,
    id: idError,
    name: 'Canceled',
    message: 'Promise is canceled',
  };
};

export const isCanceledError = <T>(error: unknown): error is TErrorCanceled<T> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return typeof error === 'object' && error !== null && 'id' in error && error.id === idError;
};
