const idError = 'ERROR_CANCELED' as 'ERROR_CANCELED';

export interface IErrorCanceled<T> {
  basePromise: Promise<T>;
  moduleName?: string;
  id: typeof idError;
  name: 'Canceled';
  message: 'Promise is canceled';
}

export const createErrorCanceled = <T = any>(
  basePromise: Promise<T>,
  moduleName = ''
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
  return error && error.id === idError;
};
