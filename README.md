# cancelable-promise

[![npm](https://img.shields.io/npm/v/@krivega/cancelable-promise?style=flat-square)](https://www.npmjs.com/package/@krivega/cancelable-promise)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@krivega/cancelable-promise?style=flat-square)

Various abstractions over promises

## Install

npm

```sh
npm install @krivega/cancelable-promise
```

yarn

```sh
yarn add @krivega/cancelable-promise
```

## Usage

### cancelablePromise

```js
import cancelablePromise, {
  isCanceledError
} from '@krivega/cancelable-promise/dist/cancelablePromise';

const basePromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('done');
  }, 5000);
});

const promise = cancelablePromise(basePromise);

promise.cancel();

promise
  .then(() => {
    // will not be called
  })
  .catch(error => {
    if (isCanceledError(error)) {
      console.log('promise is canceled!');
    }
  });
```

### CancelableRequest

```js
import CancelableRequest, {
  isCanceledError
} from '@krivega/cancelable-promise/dist/CancelableRequest';

const request = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('done');
    }, 5000);
  });

const cancelableRequester = new CancelableRequest(request);

const promise1 = cancelableRequest.request();
const promise2 = cancelableRequest.request();

promise1
  .then(() => {
    // will not be called
  })
  .catch(error => {
    if (isCanceledError(error)) {
      console.log('promise is canceled!');
    }
  });
promise1.then(() => {
  console.log('done');
});
```

## API

### CancelableRequest.cancelRequest

```js
const cancelableRequester = new CancelableRequest(request);

const promise = cancelableRequest.request();
cancelableRequest.cancelRequest();

promise
  .then(() => {
    // will not be called
  })
  .catch(error => {
    if (isCanceledError(error)) {
      console.log('promise is canceled!');
    }
  });
```

## Run tests

```sh
npm test
```

## Maintainer

**Krivega Dmitriy**

- Website: https://krivega.com
- Github: [@Krivega](https://github.com/Krivega)

## Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/Krivega/cancelable-promise/issues). You can also take a look at the [contributing guide](https://github.com/Krivega/cancelable-promise/blob/master/CONTRIBUTING.md).

## 📝 License

Copyright © 2020 [Krivega Dmitriy](https://github.com/Krivega).<br />
This project is [MIT](https://github.com/Krivega/cancelable-promise/blob/master/LICENSE) licensed.
