# ubirch-verification-js

JavaScript package to verify that data has been anchored in blockchains through the Ubirch system

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

### As a script

```html
<body>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/js-sha256/0.9.0/sha256.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/js-sha512/0.8.0/sha512.min.js"></script>
  <script src="path/to/ubirch-verification-js"></script>

  <script>
    /* UbirchVerification automatically assings itself to the window object */
    const verification = new UbirchVerification({
      /* configuration object */
    });
  </script>
</body>
```

## Utils

Package contains `UbirchFormUtils` class with following methods:
- `static getFormParamsFromUrl(windowRef: Window, separator: string): DataParams` - resolves data paramms object from url string.
- `public setDataIntoForm(params: DataParams = {}, documentRef: Document): void` - inserts the data from data params object to input fields.

## Building from sources.

`npm install`

`npm run test`

`npm run build` This will bundle a js file for the browser.

## Test on localhost

`npm install`

`npm run serve:local`

Open simple test page here:

`http://localhost:9102`

Test Values:

Token (valid on dev until 2021-06-30):

    eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2VuLmRldi51YmlyY2guY29tIiwic3ViIjoiZDYzZWNjMDMtZjVhNy00ZDQzLTkxZDAtYTMwZDAzNGQ4ZGEzIiwiYXVkIjoiaHR0cHM6Ly92ZXJpZnkuZGV2LnViaXJjaC5jb20iLCJleHAiOjE2MjUwODY0ODQsImlhdCI6MTYxODg2NTcyMywianRpIjoiZjk1NjQyODktOGU3MC00Mjk0LWEyNDItODQ2MWZiMjdhOWE4Iiwic2NwIjpbInVwcDp2ZXJpZnkiXSwicHVyIjoiVGVzdCBUb2tlbiIsInRncCI6W10sInRpZCI6WyIqIl0sIm9yZCI6W119.CVUEKZmnQf22k5WToCMpHLuFz-1QgG5-6-YnZKFIKy8LllTG3BZQ4eKOTI0R7Nn0ac1ZrSumsk9qZsuWYP2wJw

Press Button "Set UBIRCH verification token" (sorry, no feedback yet, but works if no errors occurred in console)

Insert Test JSON:

    {"b":"19111111","d":["20210104","20210127"],"f":"\\nNewline\\\\n\\\\\\n","g":"<p>Hällo</p>","i":"Altötting","p":"#%;,.<>-+*\"'?$&:*","r":"BioNTech / Pfizer Corminaty®","s":"2kmsq5fzqiu","t":"vaccination"}

Press Button "Verify JSON"

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
