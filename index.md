# ubirch-verification-js

**ATTENTION!!!! This Page is WORK-IN-PROGRESS!!!!**


JavaScript package to verify that data has been anchored by UBIRCH in a trustworthy way. It checks that the data has been anchored as a
UPP (UBIRCH Package Protocol) in blockchains by the UBIRCH Verification System.

## Usage

### From NPM registry

```
    npm i @ubirch/ubirch-verification-js js-sha256 js-sha512
    // or using Yarn
    yarn add @ubirch/ubirch-verification-js js-sha256 js-sha512
```

And then

```js
import { UbirchVerification } from '@ubirch/ubirch-verification-js';
```

## API

### UbirchVerification

#### `constructor(config: IUbirchVerificationConfig, formUtil?: IUbirchFormUtils)`

Create instance of `UbirchVerification` class with given config:
parameter | description | possible values | default value
------ | ------ | ------ | ------
**accessToken** | token | string | _required_
**algorithm** | default algorith used for hashing | `sha256`, `sha512` | `sha256`
**language** | language of the messenger messages | `en`, `de` | `en`
**stage** | the environment of verification service |`local`, `dev`, `demo`, `prod` | `prod`

As second optional parameter a `FormUtil` instance can be provided for logging infos and errors.
