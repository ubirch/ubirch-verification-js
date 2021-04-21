# ubirch-verification-js

JavaScript package to verify that data has been anchored in blockchains through the ubirch system

## Installing from NPM.

`npm i @ubirch/ubirch-verification-js js-sha256 js-sha512`

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

-> Problem: Ends up in CORS error.....

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
