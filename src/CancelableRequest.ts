import createCancelablePromise from './cancelablePromise';
import type { ICancelablePromise } from './cancelablePromise';

export interface ITargetRequest<P, R> {
  (data: P): Promise<R>;
}

type TThenArgRecursive<T> = T extends PromiseLike<infer U> ? TThenArgRecursive<U> : T;

export default class CancelableRequest<P = any, R = Promise<any>> {
  _requested: boolean;

  _canceled: boolean;

  _cancelablePromise?: ICancelablePromise<any>;

  moduleName: string;

  _basePromise?: Promise<TThenArgRecursive<R>>;

  targetRequest: ITargetRequest<P, TThenArgRecursive<R>>;

  afterCancelRequest: (basePromise: Promise<TThenArgRecursive<R>>) => void;

  constructor(
    targetRequest: ITargetRequest<P, TThenArgRecursive<R>>,
    moduleName?: string,
    afterCancelRequest: (basePromise: Promise<TThenArgRecursive<R>>) => void = () => {}
  ) {
    this._requested = false;
    this._canceled = false;

    this.targetRequest = targetRequest;
    this.moduleName = moduleName || this.constructor.name;
    this.afterCancelRequest = afterCancelRequest;
  }

  request = async (data: P): Promise<TThenArgRecursive<R>> => {
    this.cancelRequest();
    this.requested = true;
    this.canceled = false;

    const basePromise = this.targetRequest(data);

    this._basePromise = basePromise;

    this._cancelablePromise = createCancelablePromise<TThenArgRecursive<R>>(
      basePromise,
      this.moduleName
    );

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
      this.afterCancelRequest(this._basePromise as Promise<TThenArgRecursive<R>>);
      delete this._basePromise;
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
