import { createErrorCanceled } from './error';

export interface ICancelablePromise<T> extends Promise<T> {
  cancel: () => void;
}

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
export default createCancelablePromise;
