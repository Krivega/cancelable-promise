import CancelableRequest, { isCanceledError } from '../CancelableRequest';
import type { ITargetRequest } from '../CancelableRequest';

describe('CancelableRequest', () => {
  const testError = new Error('error');
  let cancelableRequest: CancelableRequest;
  let cancelableRequestErr: CancelableRequest;
  let mockFn: ITargetRequest<any>;
  let mockFnErr: ITargetRequest<Error>;
  let arg: Object;
  let afterCancelRequest: () => void;

  beforeEach(() => {
    jest.resetModules();
    afterCancelRequest = jest.fn();
    mockFn = jest.fn((data) => Promise.resolve(data));
    cancelableRequest = new CancelableRequest(mockFn, 'test', afterCancelRequest);
    mockFnErr = jest.fn(() => Promise.reject(testError));
    cancelableRequestErr = new CancelableRequest(mockFnErr);
    arg = {};
  });

  it('request resolve', () =>
    cancelableRequest.request(arg).then((data) => {
      expect(data).toEqual(arg);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(cancelableRequest._requested).toBe(false);
    }));

  it('request reject', () => {
    expect.assertions(2);

    return cancelableRequestErr.request(arg).catch((data) => {
      expect(data).toEqual(testError);
      expect(cancelableRequestErr._requested).toBe(false);
    });
  });

  it('cancelRequest no wait request', () => {
    const promise = cancelableRequest.request(arg);

    cancelableRequest.cancelRequest();

    expect(cancelableRequest._requested).toEqual(false);
    expect(cancelableRequest._canceled).toEqual(true);

    return promise.catch((error) => {
      expect(isCanceledError(error)).toEqual(true);
    });
  });

  it('cancelRequest wait request', () =>
    cancelableRequest.request(arg).then(() => {
      cancelableRequest.cancelRequest();

      expect(cancelableRequest._requested).toEqual(false);
      expect(cancelableRequest._canceled).toEqual(false);
    }));

  it('afterCancelRequest', () => {
    const promise = cancelableRequest.request(arg);

    cancelableRequest.cancelRequest();

    expect(afterCancelRequest).toHaveBeenCalledTimes(1);

    return promise.catch((error) => {
      expect(isCanceledError(error)).toEqual(true);
    });
  });

  it('set requested', () => {
    cancelableRequest.requested = true;

    expect(cancelableRequest._requested).toEqual(true);
  });

  it('get requested', () => {
    cancelableRequest.requested = true;

    expect(cancelableRequest.requested).toEqual(true);
  });

  it('set canceled', () => {
    cancelableRequest.canceled = true;

    expect(cancelableRequest._canceled).toEqual(true);
  });

  it('get canceled', () => {
    cancelableRequest.canceled = true;

    expect(cancelableRequest.canceled).toEqual(true);
  });
});
