import CancelableRequest from '../CancelableRequest';
import { isCanceledError } from '../error';

const testError = new Error('error');

describe('CancelableRequest', () => {
  // beforeEach(() => {
  //   jest.resetModules();
  // });

  it('request resolve', () => {
    expect.assertions(3);

    const mockFn = jest.fn((data: { id: string }) => {
      return Promise.resolve(data);
    });
    const cancelableRequest = new CancelableRequest<
      Parameters<typeof mockFn>[0],
      ReturnType<typeof mockFn>
    >(mockFn);

    const arg = { id: 'test' };

    return cancelableRequest.request(arg).then((data) => {
      expect(data).toEqual(arg);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(cancelableRequest._requested).toBe(false);
    });
  });

  it('request reject', () => {
    expect.assertions(2);

    const cancelableRequestErr = new CancelableRequest<void>(() => {
      return Promise.reject(testError);
    });

    return cancelableRequestErr.request().catch((data) => {
      expect(data).toEqual(testError);
      expect(cancelableRequestErr._requested).toBe(false);
    });
  });

  it('cancelRequest no wait request', () => {
    expect.assertions(4);

    const basePromise = Promise.resolve();
    const cancelableRequest = new CancelableRequest<void>(() => {
      return basePromise;
    });

    const promise = cancelableRequest.request();

    cancelableRequest.cancelRequest();

    expect(cancelableRequest._requested).toEqual(false);
    expect(cancelableRequest._canceled).toEqual(true);

    return promise.catch((error) => {
      expect(isCanceledError(error)).toEqual(true);
      expect(error.basePromise).toBe(basePromise);
    });
  });

  it('cancelRequest wait request', () => {
    expect.assertions(2);

    const cancelableRequest = new CancelableRequest<void>(() => {
      return Promise.resolve();
    });

    return cancelableRequest.request().then(() => {
      cancelableRequest.cancelRequest();

      expect(cancelableRequest._requested).toEqual(false);
      expect(cancelableRequest._canceled).toEqual(false);
    });
  });

  it('afterCancelRequest', () => {
    expect.assertions(2);

    const afterCancelRequest = jest.fn();
    const cancelableRequest = new CancelableRequest<void>(
      () => {
        return Promise.resolve();
      },
      'test',
      afterCancelRequest
    );

    const promise = cancelableRequest.request();

    cancelableRequest.cancelRequest();

    expect(afterCancelRequest).toHaveBeenCalledTimes(1);

    return promise.catch((error) => {
      expect(isCanceledError(error)).toEqual(true);
    });
  });

  it('set requested', () => {
    const cancelableRequest = new CancelableRequest<void>(() => {
      return Promise.resolve();
    });

    cancelableRequest.requested = true;

    expect(cancelableRequest._requested).toEqual(true);
  });

  it('get requested', () => {
    const cancelableRequest = new CancelableRequest<void>(() => {
      return Promise.resolve();
    });

    cancelableRequest.requested = true;

    expect(cancelableRequest.requested).toEqual(true);
  });

  it('set canceled', () => {
    const cancelableRequest = new CancelableRequest<void>(() => {
      return Promise.resolve();
    });

    cancelableRequest.canceled = true;

    expect(cancelableRequest._canceled).toEqual(true);
  });

  it('get canceled', () => {
    const cancelableRequest = new CancelableRequest<void>(() => {
      return Promise.resolve();
    });

    cancelableRequest.canceled = true;

    expect(cancelableRequest.canceled).toEqual(true);
  });
});
