import cancelablePromise from '../cancelablePromise';
import { isCanceledError } from '../error';

describe('cancelablePromise', () => {
  it('resolved', () => {
    return cancelablePromise(Promise.resolve(true)).then((data) => {
      return expect(data).toBe(true);
    });
  });

  it('rejected', () => {
    expect.assertions(1);

    const basePromiseError = new Error('error');
    const basePromise = Promise.reject(basePromiseError);
    const promise = cancelablePromise(basePromise);

    return promise.catch((error) => {
      expect(error).toBe(basePromiseError);
    });
  });

  it('canceled resolve', () => {
    expect.assertions(2);

    const basePromise = Promise.resolve(true);
    const promise = cancelablePromise(basePromise);

    promise.cancel();

    return promise.catch((error) => {
      expect(isCanceledError(error)).toBe(true);
      expect(error.basePromise).toBe(basePromise);
    });
  });

  it('cancellation resolves promise', () => {
    expect.assertions(1);

    const basePromise = Promise.resolve(true);
    const promise = cancelablePromise(basePromise, {
      cancellationResolvesPromise: true,
    });

    promise.cancel();

    return expect(promise).resolves.toBe(undefined);
  });

  it('canceled reject', () => {
    expect.assertions(2);

    const basePromise = Promise.reject(new Error('test'));
    const promise = cancelablePromise(basePromise);

    promise.cancel();

    return promise.catch((error) => {
      expect(isCanceledError(error)).toBe(true);
      expect(error.basePromise).toBe(basePromise);
    });
  });
});
