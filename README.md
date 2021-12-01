# ubirch-verification-js

JavaScript package to verify that data has been anchored by UBIRCH in a trustworthy way. It checks that the data has been anchored as a
UPP (UBIRCH Package Protocol) in blockchains by the UBIRCH Certification System.

The UbirchVerification package consists of three parts:

* **UbirchVerification** - contains the core functionality of verifying hashes or JSON against the UBIRCH system
* **UbirchVerificationWidget** - a Widget, that can be included into your website, showing the result of the verification in a simple UI
* **UbirchFormUtils** - helper tool to handle forms and URL query/fragment parameters to display the verified data easily

## Usage

**NPM Package**:  [@ubirch/ubirch-verification-js NPM package](https://www.npmjs.com/package/@ubirch/ubirch-verification-js)

```
    npm i @ubirch/ubirch-verification-js js-sha256 js-sha512
    // or using Yarn
    yarn add @ubirch/ubirch-verification-js js-sha256 js-sha512
```

**Documentation**: [documentation of the ubirch-verification-js](https://developer.ubirch.com/ubirch-verification-js/)

**Examples Repository**: [https://github.com/ubirch/ubirch-verify-widget](https://github.com/ubirch/ubirch-verify-widget)

**Github Repository**: [https://github.com/ubirch/ubirch-verification-js](https://github.com/ubirch/ubirch-verification-js)

## Building from sources.

`npm install`

`npm run test`

`npm run build` This will bundle a js file for the browser in the `./dist` folder.

## Test on localhost

`npm install`

`npm run serve:local`

Open simple test page here:

`http://localhost:9102`

## Copyright

```fundamental
Copyright (c) 2021 ubirch GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
