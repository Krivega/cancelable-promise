/// <reference types="jest" />

/* eslint-disable jest/no-conditional-expect */
import CancelableRequest from '../CancelableRequest';
import type { IErrorCanceled } from '../error';
import { isCanceledError } from '../error';

const testError = new Error('error');

describe('CancelableRequest', () => {
  it('request resolve', async () => {
    expect.assertions(3);

    const mockFunction = jest.fn(async (data: { id: string }) => {
      return data;
    });
    const cancelableRequest = new CancelableRequest(mockFunction);

    const argument = { id: 'test' };

    return cancelableRequest.request(argument).then((data) => {
      expect(data).toEqual(argument);
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(cancelableRequest.requested).toBe(false);
    });
  });

  it('request reject', async () => {
    expect.assertions(2);

    const cancelableRequestError = new CancelableRequest<void>(async () => {
      throw testError;
    });

    return cancelableRequestError.request().catch((error: unknown) => {
      expect(error).toEqual(testError);
      expect(cancelableRequestError.requested).toBe(false);
    });
  });

  it('cancelRequest no wait request', async () => {
    expect.assertions(6);

    const basePromise = Promise.resolve();
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    const cancelableRequest = new CancelableRequest(() => {
      return basePromise;
    });

    const promise = cancelableRequest.request();

    expect(cancelableRequest.requested).toEqual(true);
    expect(cancelableRequest.canceled).toEqual(false);

    cancelableRequest.cancelRequest();

    expect(cancelableRequest.requested).toEqual(false);
    expect(cancelableRequest.canceled).toEqual(true);

    return promise.catch((error: unknown) => {
      expect(isCanceledError(error)).toEqual(true);
      expect((error as IErrorCanceled<unknown>).basePromise).toBe(basePromise);
    });
  });

  it('cancelRequest wait request', async () => {
    expect.assertions(2);

    const cancelableRequest = new CancelableRequest<void>(async () => {});

    return cancelableRequest.request().then(() => {
      cancelableRequest.cancelRequest();

      expect(cancelableRequest.requested).toEqual(false);
      expect(cancelableRequest.canceled).toEqual(false);
    });
  });

  it('afterCancelRequest', async () => {
    expect.assertions(3);

    const basePromise = Promise.resolve();
    const afterCancelRequest = jest.fn();
    const cancelableRequest = new CancelableRequest<void>(
      async () => {
        return basePromise;
      },
      {
        afterCancelRequest,
      },
    );

    const promise = cancelableRequest.request();

    cancelableRequest.cancelRequest();

    expect(afterCancelRequest).toHaveBeenCalledTimes(1);

    return promise.catch((error: unknown) => {
      expect(isCanceledError(error)).toEqual(true);
      expect(afterCancelRequest).toHaveBeenCalledWith(basePromise);
    });
  });

  it('cancellation resolves request', async () => {
    expect.assertions(1);

    const basePromise = Promise.resolve(true);
    const cancelableRequest = new CancelableRequest<void>(
      async () => {
        return basePromise;
      },
      {
        cancellationResolvesRequest: true,
      },
    );

    const promise = cancelableRequest.request();

    cancelableRequest.cancelRequest();

    return expect(promise).resolves.toBe(undefined);
  });
});
