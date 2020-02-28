const idError = 'ERROR_CANCELED';

/**
 * Creates an error canceled.
 *
 * @param {Promise} basePromise - The base promise
 * @param {string}  moduleName  - The module name
 *
 * @returns {object} error
 */
export const createErrorCanceled = (basePromise, moduleName = '') => ({
  basePromise,
  moduleName,
  id: idError,
  name: 'Canceled',
  message: 'Promise is canceled'
});

/**
 * cancelablePromise
 *
 * @param {Promise} basePromise - The base promise
 * @param {string}  moduleName  - The module name
 *
 * @returns {Promise} cancelablePromise
 */
const cancelablePromise = (basePromise, moduleName) => {
  let rejectOuter;

  const promise = new Promise((resolve, reject) => {
    rejectOuter = reject;
    basePromise.then(resolve).catch(reject);
  });

  promise.cancel = () => {
    rejectOuter(createErrorCanceled(basePromise, moduleName));
  };

  return promise;
};

/**
 * Determines if canceled error.
 *
 * @param {Object} param param
 * @param {string} param.id - The identifier
 *
 * @returns {boolean} True if canceled error, False otherwise.
 */
export const isCanceledError = ({ id }) => id === idError;

export default cancelablePromise;
