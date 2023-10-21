import { createErrorCanceled } from './error';

export type ICancelablePromise<T> = Promise<T> & {
  cancel: () => void;
};

function createCancelablePromise<T = unknown>(
  basePromise: Promise<T>,
  {
    moduleName,
    cancellationResolvesPromise,
  }: {
    cancellationResolvesPromise?: boolean;
    moduleName?: string;
  } = {},
): ICancelablePromise<T> {
  let rejectOuter: (reason?: unknown) => void;
  let resolveOuter: (value: PromiseLike<T> | T) => void;

  const promise = new Promise<T>((resolve, reject) => {
    rejectOuter = reject;
    resolveOuter = resolve;
    basePromise.then(resolve).catch(reject);
  });

  const cancelablePromise: ICancelablePromise<T> = promise as ICancelablePromise<T>;

  cancelablePromise.cancel = () => {
    if (cancellationResolvesPromise === true) {
      resolveOuter(undefined as T);
    } else {
      rejectOuter(createErrorCanceled<T>(basePromise, moduleName));
    }
  };

  return cancelablePromise;
}

export default createCancelablePromise;
