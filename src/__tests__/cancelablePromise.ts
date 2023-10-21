/* eslint-disable jest/no-conditional-expect */
import cancelablePromise from '../cancelablePromise';
import { isCanceledError } from '../error';

describe('cancelablePromise', () => {
  it('resolved', async () => {
    return cancelablePromise(Promise.resolve(true)).then((data) => {
      expect(data).toBe(true);
    });
  });

  it('rejected', async () => {
    expect.assertions(1);

    const basePromiseError = new Error('error');
    const basePromise = Promise.reject(basePromiseError);
    const promise = cancelablePromise(basePromise);

    return promise.catch((error) => {
      expect(error).toBe(basePromiseError);
    });
  });

  it('canceled resolve', async () => {
    expect.assertions(2);

    const basePromise = Promise.resolve(true);
    const promise = cancelablePromise(basePromise);

    promise.cancel();

    return promise.catch((error) => {
      expect(isCanceledError(error)).toBe(true);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(error.basePromise).toBe(basePromise);
    });
  });

  it('cancellation resolves promise', async () => {
    expect.assertions(1);

    const basePromise = Promise.resolve(true);
    const promise = cancelablePromise(basePromise, {
      cancellationResolvesPromise: true,
    });

    promise.cancel();

    return expect(promise).resolves.toBe(undefined);
  });

  it('canceled reject', async () => {
    expect.assertions(2);

    const basePromise = Promise.reject(new Error('test'));
    const promise = cancelablePromise(basePromise);

    promise.cancel();

    return promise.catch((error) => {
      expect(isCanceledError(error)).toBe(true);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(error.basePromise).toBe(basePromise);
    });
  });
});
