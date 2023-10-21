const idError = 'ERROR_CANCELED' as const;

export type IErrorCanceled<T> = {
  basePromise: Promise<T>;
  moduleName?: string;
  id: typeof idError;
  name: 'Canceled';
  message: 'Promise is canceled';
};

export const createErrorCanceled = <T = any>(
  basePromise: Promise<T>,
  moduleName = '',
): IErrorCanceled<T> => {
  return {
    basePromise,
    moduleName,
    id: idError,
    name: 'Canceled',
    message: 'Promise is canceled',
  };
};

export const isCanceledError = (error: any): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return typeof error === 'object' && 'id' in error && error.id === idError;
};
