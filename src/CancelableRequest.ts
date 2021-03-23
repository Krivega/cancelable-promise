import createCancelablePromise, { isCanceledError as _isCanceledError } from './cancelablePromise';
import type { ICancelablePromise } from './cancelablePromise';

export interface ITargetRequest<T> {
  (args?: any[]): Promise<T>;
}

export default class CancelableRequest<T = any> {
  _requested: boolean;

  _canceled: boolean;

  _cancelablePromise?: ICancelablePromise<T>;

  moduleName: string;

  targetRequest: ITargetRequest<T>;

  afterCancelRequest: () => void;

  constructor(
    targetRequest: ITargetRequest<T>,
    moduleName?: string,
    afterCancelRequest = () => {}
  ) {
    this._requested = false;
    this._canceled = false;

    this.targetRequest = targetRequest;
    this.moduleName = moduleName || this.constructor.name;
    this.afterCancelRequest = afterCancelRequest;
  }

  request = async (...args: any[]) => {
    this.cancelRequest();
    this.requested = true;
    this.canceled = false;

    this._cancelablePromise = createCancelablePromise(this.targetRequest(...args), this.moduleName);

    try {
      const result = await this.cancelablePromise;

      this.requested = false;

      return result;
    } catch (e) {
      this.requested = false;

      throw e;
    }
  };

  cancelRequest() {
    const request = this.cancelablePromise;

    if (request && this.requested) {
      this.requested = false;
      this.canceled = true;
      request.cancel();
      this.afterCancelRequest();
    }
  }

  set cancelablePromise(cancelablePromise) {
    this._cancelablePromise = cancelablePromise;
  }

  get cancelablePromise() {
    return this._cancelablePromise;
  }

  set requested(requested: boolean) {
    this._requested = requested;
  }

  get requested(): boolean {
    return this._requested;
  }

  set canceled(canceled: boolean) {
    this._canceled = canceled;
  }

  get canceled(): boolean {
    return this._canceled;
  }
}

export const isCanceledError = _isCanceledError;
