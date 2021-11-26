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
A working example ca be found in the Repository [ubirch-verify-widget](https://github.com/ubirch/ubirch-verify-widget)

## API

The UbirchVerification package consists of three parts:

* UbirchVerification - contains the core functionality of verifying hashes or JSON against the UBIRCH system
* UbirchVerificationWidget - a Widget, that can be included into your website, showing the result of the verification in a simple UI
* UbirchFormUtils - helper tool to handle forms and URL query/fragment parameters to display the verified data easily

### UbirchVerification

* To use the core functionality to verify hashes against the UBIRCH system without any UI import and use UbirchVerification:

```js
import { UbirchVerification, UbirchVerificationWidget, UbirchFormUtils } from '@ubirch/ubirch-verification-js';
```

#### `constructor(config: IUbirchVerificationConfig, formUtil?: IUbirchFormUtils)`

Create instance of `UbirchVerification` class with given config:
parameter | description | possible values | default value
------ | ------ | ------ | ------
**accessToken** | UBIRCH verification token | string | _required_
**algorithm** | algorith used for hashing | `sha256`, `sha512` | `sha256`
**language** | language of the messenger messages | `en`, `de` | `en`
**stage** | the environment of verification service |`local`, `dev`, `demo`, `prod` | `prod`

As second optional parameter a `FormUtil` instance can be provided for logging infos and errors.

### UbirchVerificationWidget

Import for widget (form utils optional in addition)
```js
import { UbirchVerificationWidget, UbirchFormUtils } from '@ubirch/ubirch-verification-js';
```



## Example Code

### Hash/JSON Verification

As said before for the use of the verification widget we need a div tag with an id,
that needs to be inserted into the hostSelector of the UbirchVerificationWidget. We use `#widget-root`

```html
    ...
    <button id="verify-json-button">VERIFY: JSON</button>
    <div id="widget-root"></div>
    ...
```



```js
import { UbirchVerificationWidget } from "./node_modules/@ubirch/ubirch-verification-js";

const testJSON = '{"b":"19111111","d":["20210104","20210127"],"f":"\\\\nNewline\\\\\\\\n\\\\\\\\\\\\n","g":"<p>Hällo</p>","i":"Altötting","p":"#%;,.<>-+*\\"\'?$&:*","r":"BioNTech / Pfizer Corminaty®","s":"2kmsq5fzqiu","t":"vaccination"}';
// verify JSON button click listener
document.getElementById('verify-json-button').addEventListener('click', function () {
  verifyJSON(testJSON);
});
// alternatively verification can be started when page is loaded automatically
// document.addEventListener('DOMContentLoaded', verifyJSON);

function verifyJSON(json: string) {

  // create ubirchVerificationWidget instance
  const ubirchVerificationWidget = new UbirchVerificationWidget({
    accessToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2VuLmRldi51YmlyY2guY29tIiwic3ViIjoiYzBiNTc3ZmItMWNlZi00YzZmLThjNTAtOGQzYTFlNmVhNzUzIiwiYXVkIjoiaHR0cHM6Ly92ZXJpZnkuZGV2LnViaXJjaC5jb20iLCJleHAiOjE2NzI1MDQxNTgsImlhdCI6MTYzNzU5ODYzMSwianRpIjoiYTlmNTFmYzUtZTgyZi00MDczLTlhYTYtZmI3Yjk3NGViYTIzIiwic2NwIjpbInVwcDp2ZXJpZnkiXSwicHVyIjoiMjAyMiBERVYgV2lsZGNhcmQgVGVzdCBUb2tlbiIsInRncCI6W10sInRpZCI6WyIqIl0sIm9yZCI6W119.gnzzkp7eO4HtaLOG9Df7ll3-UT9Yo-pXmeRUI21e3lkJan_ju_0mC6FdDHLLgiI9nsYlQ7rmyvKHzbyaLMLYGw",
    stage: 'dev',
    algorithm: 'sha256',
    hostSelector: '#widget-root',
  });

  try {
    const hash = ubirchVerificationWidget.createHash(JSON.stringify(json));
    ubirchVerificationWidget.verifyHash(hash);
  } catch (e) {
    console.log('Fehler! ' + e);
  }

}
```

### Form Data Verification

Form data can be red from the url query or fragment parameters.
The parameters from that are mapped to ids of the form input fields.
The form input fields should to be readonly to prevent hacking of your site.

As said before for the use of the verification widget we need a div tag with an id,
that needs to be inserted into the hostSelector of the UbirchVerificationWidget. We use `#widget-root`

```html
    ...
    <form>
      <label for="a" class="formLabel">Key A:</label>
      <input type="text" id="a" class="formInput" readonly="">
      <label for="b" class="formLabel">Key B:</label>
      <input type="text" id="b" class="formInput" readonly="">
      <label for="c" class="formLabel">Key C:</label>
      <input type="text" id="c" class="formInput" readonly="">
    </form>
    <button id="verify-form-button">VERIFY: FORM</button>
    <div id="widget-root"></div>
    ...
```

We need to provide these parameter and input ids to the UbirchFormUtils constructor.


```js
import { UbirchVerificationWidget, UbirchFormUtils } from "./node_modules/@ubirch/ubirch-verification-js";

// verify JSON button click listener
document.getElementById('verify-form-button').addEventListener('click', function () {
  verifyForm();
});
// alternatively verification can be started when page is loaded automatically
// document.addEventListener('DOMContentLoaded', verifyForm);

function verifyForm() {

  const formIds = ["a", "b", "c"];

  // create ubirchVerificationWidget instance
  const ubirchVerificationWidget = new UbirchVerificationWidget({
    accessToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2VuLmRldi51YmlyY2guY29tIiwic3ViIjoiYzBiNTc3ZmItMWNlZi00YzZmLThjNTAtOGQzYTFlNmVhNzUzIiwiYXVkIjoiaHR0cHM6Ly92ZXJpZnkuZGV2LnViaXJjaC5jb20iLCJleHAiOjE2NzI1MDQxNTgsImlhdCI6MTYzNzU5ODYzMSwianRpIjoiYTlmNTFmYzUtZTgyZi00MDczLTlhYTYtZmI3Yjk3NGViYTIzIiwic2NwIjpbInVwcDp2ZXJpZnkiXSwicHVyIjoiMjAyMiBERVYgV2lsZGNhcmQgVGVzdCBUb2tlbiIsInRncCI6W10sInRpZCI6WyIqIl0sIm9yZCI6W119.gnzzkp7eO4HtaLOG9Df7ll3-UT9Yo-pXmeRUI21e3lkJan_ju_0mC6FdDHLLgiI9nsYlQ7rmyvKHzbyaLMLYGw",
    stage: 'dev',
    algorithm: 'sha256',
    hostSelector: '#widget-root',
    
  });

  try {
    const formUtils = new UbirchFormUtils({
      formIds
    });

    const jsonFromFormData = formUtils.getFormParamsFromUrl(window, ';');

    formUtils.setDataIntoForm(jsonFromFormData, window.document);

    const hash = ubirchVerificationWidget.createHash(JSON.stringify(jsonFromFormData));
    ubirchVerificationWidget.verifyHash(hash);

  } catch (e) {
    console.log('Fehler! ' + e);
  }
}
```
