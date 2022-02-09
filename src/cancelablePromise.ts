const idError = 'ERROR_CANCELED' as 'ERROR_CANCELED';

export interface ICancelablePromise<T> extends Promise<T> {
  cancel: () => void;
}

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

const createCancelablePromise = <T = any>(
  basePromise: Promise<T>,
  moduleName?: string
): ICancelablePromise<T> => {
  let rejectOuter: (reason?: any) => void;

  const promise = new Promise((resolve, reject) => {
    rejectOuter = reject;
    basePromise.then(resolve).catch(reject);
  });

  const cancelablePromise: ICancelablePromise<T> = promise as ICancelablePromise<T>;

  cancelablePromise.cancel = () => {
    rejectOuter(createErrorCanceled<T>(basePromise, moduleName));
  };

  return cancelablePromise;
};

export const isCanceledError = ({ id }: any): boolean => {
  return id === idError;
};

export default createCancelablePromise;
