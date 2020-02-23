import cancelablePromise, { isCanceledError as _isCanceledError } from './cancelablePromise';

/**
 * CancelableRequest
 * @class
 */
export default class CancelableRequest {
  /**
   * Constructs the object.
   *
   * @param {function} targetRequest    - The target request
   * @param {string}   moduleName       - The module name
   * @param {function} cancelSubRequest - The function for cancel subrequest
   */
  constructor(targetRequest, moduleName, cancelSubRequest = () => {}) {
    this._requested = false;
    this._canceled = false;
    this._requestObj = null;

    this.targetRequest = targetRequest;
    this.moduleName = moduleName || this.constructor.name;
    this.cancelSubRequest = cancelSubRequest;
  }

  /**
   * request
   * @async
   *
   * @param {Object} args - args
   *
   * @returns {Promise} request
   */
  request = async (...args) => {
    this.cancelRequest();
    this.requested = true;
    this.canceled = false;

    this.requestObj = cancelablePromise(this.targetRequest(...args), this.moduleName);

    try {
      const result = await this.requestObj;

      this.requested = false;

      return result;
    } catch (e) {
      this.requested = false;

      throw e;
    }
  };

  /**
   * cancelRequest
   *
   * @returns {void}
   */
  cancelRequest() {
    const request = this.requestObj;

    if (request && this.requested) {
      this.requested = false;
      this.canceled = true;
      request.cancel();
      this.cancelSubRequest();
    }
  }

  /**
   * requestObj setter
   *
   * @param {Object} request request
   */
  set requestObj(request) {
    this._requestObj = request;
  }

  /**
   * requestObj getter
   *
   * @returns {Promise} request requestObj
   */
  get requestObj() {
    return this._requestObj;
  }

  /**
   * requested setter
   *
   * @param {boolean} requested - requested
   *
   * @returns {void}
   */
  set requested(requested) {
    this._requested = requested;
  }

  /**
   * requested getter
   *
   * @returns {boolean} true if request is active
   */
  get requested() {
    return this._requested;
  }

  /**
   * canceled setter
   *
   * @param {boolean} canceled - canceled
   *
   * @returns {void}
   */
  set canceled(canceled) {
    this._canceled = canceled;
  }

  /**
   * canceled getter
   *
   * @return {boolean} canceled
   */
  get canceled() {
    return this._canceled;
  }
}

export const isCanceledError = _isCanceledError;
