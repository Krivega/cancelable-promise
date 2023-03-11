import createCancelablePromise from './cancelablePromise';
import type { ICancelablePromise } from './cancelablePromise';

export interface ITargetRequest<P, R> {
  (data: P): Promise<R>;
}

type TThenArgRecursive<T> = T extends PromiseLike<infer U> ? TThenArgRecursive<U> : T;

export default class CancelableRequest<P = any, R = Promise<any>> {
  _cancellationResolvesRequest: boolean;

  _requested: boolean;

  _canceled: boolean;

  _cancelablePromise?: ICancelablePromise<any>;

  moduleName: string;

  _basePromise?: Promise<TThenArgRecursive<R>>;

  _targetRequest: ITargetRequest<P, TThenArgRecursive<R>>;

  _afterCancelRequest?: (basePromise: Promise<TThenArgRecursive<R>>) => void;

  constructor(
    targetRequest: ITargetRequest<P, TThenArgRecursive<R>>,
    {
      moduleName,
      afterCancelRequest,
      cancellationResolvesRequest = false,
    }: {
      moduleName?: string;
      afterCancelRequest?: (basePromise: Promise<TThenArgRecursive<R>>) => void;
      cancellationResolvesRequest?: boolean;
    } = {}
  ) {
    this._requested = false;
    this._canceled = false;
    this._cancellationResolvesRequest = cancellationResolvesRequest;

    this._targetRequest = targetRequest;
    this.moduleName = moduleName || this.constructor.name;
    this._afterCancelRequest = afterCancelRequest;
  }

  request = async (data: P): Promise<TThenArgRecursive<R>> => {
    this.cancelRequest();
    this.requested = true;
    this.canceled = false;

    const basePromise = this._targetRequest(data);

    this._basePromise = basePromise;

    this._cancelablePromise = createCancelablePromise<TThenArgRecursive<R>>(basePromise, {
      moduleName: this.moduleName,
      cancellationResolvesPromise: this._cancellationResolvesRequest,
    });

    try {
      const result: TThenArgRecursive<R> = (await this.cancelablePromise) as TThenArgRecursive<R>;

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
      this._processAfterCancelRequest();
    }
  }

  _processAfterCancelRequest() {
    if (this._afterCancelRequest) {
      this._afterCancelRequest(this._basePromise as Promise<TThenArgRecursive<R>>);
    }

    delete this._basePromise;
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
