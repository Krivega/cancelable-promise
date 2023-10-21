import type { ICancelablePromise } from './cancelablePromise';
import createCancelablePromise from './cancelablePromise';

export type ITargetRequest<P, R> = (data: P) => Promise<R>;

type TThenArgumentRecursive<T> = T extends PromiseLike<infer U> ? TThenArgumentRecursive<U> : T;

export default class CancelableRequest<P = any, R = Promise<any>> {
  public moduleName: string;

  private readonly _cancellationResolvesRequest: boolean;

  private _requested: boolean;

  private _canceled: boolean;

  private _cancelablePromise?: ICancelablePromise<any>;

  private _basePromise?: Promise<TThenArgumentRecursive<R>>;

  private readonly _targetRequest: ITargetRequest<P, TThenArgumentRecursive<R>>;

  private readonly _afterCancelRequest?: (basePromise: Promise<TThenArgumentRecursive<R>>) => void;

  public constructor(
    targetRequest: ITargetRequest<P, TThenArgumentRecursive<R>>,
    {
      moduleName,
      afterCancelRequest,
      cancellationResolvesRequest = false,
    }: {
      moduleName?: string;
      afterCancelRequest?: (basePromise: Promise<TThenArgumentRecursive<R>>) => void;
      cancellationResolvesRequest?: boolean;
    } = {},
  ) {
    this._requested = false;
    this._canceled = false;
    this._cancellationResolvesRequest = cancellationResolvesRequest;

    this._targetRequest = targetRequest;
    this.moduleName = moduleName ?? this.constructor.name;
    this._afterCancelRequest = afterCancelRequest;
  }

  private set cancelablePromise(cancelablePromise) {
    this._cancelablePromise = cancelablePromise;
  }

  public get cancelablePromise() {
    return this._cancelablePromise;
  }

  private set requested(requested: boolean) {
    this._requested = requested;
  }

  public get requested(): boolean {
    return this._requested;
  }

  private set canceled(canceled: boolean) {
    this._canceled = canceled;
  }

  public get canceled(): boolean {
    return this._canceled;
  }

  public request = async (data: P): Promise<TThenArgumentRecursive<R>> => {
    this.cancelRequest();
    this.requested = true;
    this.canceled = false;

    const basePromise = this._targetRequest(data);

    this._basePromise = basePromise;

    this._cancelablePromise = createCancelablePromise<TThenArgumentRecursive<R>>(basePromise, {
      moduleName: this.moduleName,
      cancellationResolvesPromise: this._cancellationResolvesRequest,
    });

    try {
      const result: TThenArgumentRecursive<R> = (await this
        .cancelablePromise) as TThenArgumentRecursive<R>;

      this.requested = false;

      return result;
    } catch (error) {
      this.requested = false;

      throw error;
    }
  };

  public cancelRequest() {
    const request = this.cancelablePromise;

    if (request && this.requested) {
      this.requested = false;
      this.canceled = true;
      request.cancel();
      this._processAfterCancelRequest();
    }
  }

  private _processAfterCancelRequest() {
    if (this._afterCancelRequest) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this._afterCancelRequest(this._basePromise!);
    }

    delete this._basePromise;
  }
}
