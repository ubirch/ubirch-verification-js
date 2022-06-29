# ubirch-verification-js

JavaScript package to verify that data has been anchored by UBIRCH in a trustworthy way. It checks that the data has been anchored as a
UPP (UBIRCH Package Protocol) in blockchains by the UBIRCH Certification System.

The UbirchVerification package consists of three parts:

* **UbirchVerification** - contains the core functionality of verifying hashes or JSON against the UBIRCH system
* **UbirchVerificationWidget** - a Widget, that can be included into your website, showing the result of the verification in a simple UI
* **UbirchFormUtils** - helper tool to handle forms and URL query/fragment parameters to display the verified data easily

[ubirch-verification-js Repository on GitHub](https://github.com/ubirch/ubirch-verification-js)

A working example can be found in the Repository [ubirch-verify-widget](https://github.com/ubirch/ubirch-verify-widget)

## What's New?

Since Version 1.5.2 ubirch-verification-js supports ECDSA and (new) EDDSA public keys for signature verification.

## Usage

### From NPM registry

Install package from npm

```
    npm i @ubirch/ubirch-verification-js js-sha256 js-sha512
    // or using Yarn
    yarn add @ubirch/ubirch-verification-js js-sha256 js-sha512
```

### Use Verification Widget from Script Tag

If you want to include ubirch verification widget directly in script tag add the following lines to your html page: 

```
<script src="https://cdnjs.cloudflare.com/ajax/libs/js-sha256/0.9.0/sha256.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/js-sha512/0.8.0/sha512.min.js"></script>
<script src="https://unpkg.com/@ubirch/ubirch-verification-js/dist/index.js"></script>
```

## Example Code

### Simple Verification Widget Example with Script Tag Inclusion

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Simple Ubirch Verification Widget</title>
</head>
<body>
<div id="form-area">
  <div class="section">
    <div class="input-field" style="padding: 10px;">
      <label for="hash-input">hash:</label><br>
      <input placeholder="" type="text" id="hash-input" style="width: 600px;" value="fDqiCojhrAUSaDPIUi52msChXyB3VRWFWAT+V0WhFiQ=">
    </div>
    <button id="hash-test">
      Test hash verification
    </button>
  </div>
  <div id="widget-root"></div>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/js-sha256/0.9.0/sha256.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/js-sha512/0.8.0/sha512.min.js"></script>
<script src="https://unpkg.com/@ubirch/ubirch-verification-js/dist/index.js"></script>
<script>
  let ubirchVerificationWidget;
  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2VuLmRldi51YmlyY2guY29tIiwic3ViIjoiYzBiNTc3ZmItMWNlZi00YzZmLThjNTAtOGQzYTFlNmVhNzUzIiwiYXVkIjoiaHR0cHM6Ly92ZXJpZnkuZGV2LnViaXJjaC5jb20iLCJleHAiOjE2NzI0ODQ3NDgsImlhdCI6MTYzOTQ3OTk4NywianRpIjoiMTJlOWI0YTItMGU2Zi00ZGI5LWJjNjgtMDMwNDM1MjhmZDkzIiwic2NwIjpbInVwcDp2ZXJpZnkiXSwicHVyIjoiMjAyMiBEZWZhdWx0IFRlc3QgV2lsZGNhcmQgVG9rZW4iLCJ0Z3AiOltdLCJ0aWQiOlsiKiJdLCJvcmQiOltdfQ.MYTjEHGNG-BT_rdJtSXwfbFZZ53gtjWRbUc7iZlVNv0YPmVOVtQ5U_xUPJV5l7WDvyFrhqAnh5TtVvmo4j3oew";

  document.addEventListener("DOMContentLoaded", function () {
    // create UbirchVerification instance
    ubirchVerificationWidget = new window.UbirchVerificationWidget({
      algorithm: "sha256",
      stage: "dev",
      accessToken: token,
      hostSelector: '#widget-root',
    });
  });

  // test hash button click listener
  document.getElementById('hash-test').addEventListener('click', function () {
    ubirchVerificationWidget.verifyHash(document.getElementById('hash-input').value);
  });
</script>
</body>
</html>
```


### Hash/JSON Verification

As said before for the use of the verification widget we need a div tag with an id,
that needs to be inserted into the hostSelector of the UbirchVerificationWidget. We use `#widget-root`

```html
    ...
    <button id="verify-json-button">VERIFY: JSON</button>
    <div id="widget-root"></div>
    ...
```



```ts
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


```ts
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

## API

### UbirchVerification Core Functionality: <code>UbirchVerification</code>

#### Import `UbirchVerification`

* To use the core functionality to verify hashes against the UBIRCH system without any UI import and use UbirchVerification:

```ts
import { UbirchVerification } from '@ubirch/ubirch-verification-js';
```

#### `constructor(config: IUbirchVerificationConfig)`

Create instance of `UbirchVerification` class with config settings.

```ts
const ubirchVerification = new UbirchVerification({
  accessToken: 'eya1s2d3f4g5h6j7k8...',
  algorithm: 'sha512',
  state: 'demo',
  language: 'en'
});
```

##### config settings:

| Attribute                | Type    | Values       |  Default      | Description                                                    |
| ------------------------ | ------- | -----------  | -----------   | -------------------------------------------------------------- |
| <code>accessToken</code> | string  |              | **REQUIRED** | is a UBIRCH verification token. You can create verification tokens for your things in the [ubirch-console](https://console.prod.ubirch.com). If you anchored data through one of your things you need to add the token created for verification of this thing to the UbirchVerification here.                                       |
| <code>algorithm</code>   | String  | 'sha256', 'sha512' | 'sha256' | hashing algorithm used during anchoring of your data          |
| <code>stage</code>       | String  | 'dev, demo, 'qa', 'prod' | 'prod'  |optional param to set UBRICH stage against which UbirchVerification tries to verify |
| <code>language</code>    | String  | 'de', 'en'  | 'de' | optional param to set language of widget strings                               |

#### Verify hash: `verifyHash(hash: string, verbose = false): Promise<IUbirchVerificationResult>`

You can verify a hash (hashed JSON data) against the UBIRCH system.


```ts
ubirchVerificationWidget
  .verifyHash(hash)
  .then((response) => {
    const msg = 'Verification Result:\n' + JSON.stringify(response, null, 2);
    console.log(msg);
  })
  .catch((errResponse) => {
    const msg =
      'Verification failed!!\n\nErrorResponse:\n' + JSON.stringify(errResponse, null, 2);
    console.log(msg);
  });
```

| Attribute         | Type    | Values       |  Default      | Description                                                    |
| ----------------  | ------- | -----------  | -----------   | -------------------------------------------------------------- |
| <code>hash</code> | string  |              | **REQUIRED** | hash that shall be verified against the UBIRCH system. **Attention**: uses the hashing algorithm and verifies against the stage defined in the UbirchVerification constructor's <code>algorithm</code> field |
| <code>verbose</code> | boolean  |              | <code>false</code> | optional parameter, set it to `true` if you need the whole verification tree with full path from UPP to upper AND lower blockchain nodes and through all UBIRCH foundation and master trees |


The response will be a `Promise` in this structure:

```ts
interface IUbirchVerificationResult {
  hash: string;
  upp: {
    upp: string;
    state: 'created' | 'anchored';
  };
  anchors: IUbirchBlockchainAnchor[];
  firstAnchorTimestamp: string | null;
  creationTimestamp: string;
  verificationState: 'VERIFICATION_PENDING' | 'VERIFICATION_FAILED' | 'VERIFICATION_PARTLY_SUCCESSFUL' | 'VERIFICATION_SUCCESSFUL';
  rawData?: any;
  lowerAnchors?: IUbirchBlockchainAnchor[];
  failReason?: EError;
}
```
* `creationTimestamp` constains the timestamp when the UPP has been created in the UBIRCH system
* `firstAnchorTimestamp` constains the timestamp when the UPP has been anchored in a blockchain the first time; will be null before first blockchain anchoring
* `rawData` is an optional parameter that will be present only available if verbose flag is set; contains the raw JSON response from verification API
* `lowerAnchors` is an optional parameter that will be present only available if verbose flag is set; contains the predecessor blockchain anchors in the trust chain
* `failReason` is an optional parameter that will be present if an error occurred, containing an error key indicating which error has happened. 

The anchors will be in the following structure:

```ts
interface IUbirchBlockchainAnchor {
  txid: string;
  networkInfo: string;
  networkType: string;
  blockchain: string;
  timestamp: string;
  iconUrl: string;
  blxTxExplorerUrl: string;
  label: string;
}
```
**Remark:**
the `raw` parameter has been removed from `IUbirchBlockchainAnchor` interface.
If you need it you have to call the verifiyHash endpoint with the `verbose` flag set to true.
The raw anchors result will be part of the `rawData` parameter of the `IUbirchVerificationResult`.

#### Create Hash from JSON: <code>createHash(json: string, hashAlgorithm: EHashAlgorithms = this.algorithm, leaveUntouched = false): string</code>

With method `createHash(json)` you can create a hash from JSON data.
The params of the JSON do not need to be alphabetically ordered here,
but before hashing the JSON they will be ordered and trimmed.

If you create UPPs by the UBIRCH clients or Certify App, the JSON is trimmed and the keys are sorted in alphabetical
order recursively.
So, if you anchor a document manually be sure to order the params in the JSON alphabetically
and remove all spaces.

If you need to verify an unsorted JSON, structure the JSON as it is anchored and call `createHash` 
with optional third param <code>leaveUntouched</code> as `true`.

With the second - optional - parameter of this method you can overwrite the used hash algorithm.
If unset the hash algorithm set in the constructor is used.


```ts
const hash = ubirchVerification.createHash(json, 'sha256', true);
```

| Attribute         | Type    | Values       |  Default      | Description                                                    |
| ----------------  | ------- | -----------  | -----------   | -------------------------------------------------------------- |
| <code>json</code> | string  |              | **REQUIRED** | Data in JSON Format that shall be prepared for verification against the UBIRCH system. |
| <code>hashAlgorithm</code> | string  | 'sha256', 'sha512' | <code>ubirchVerification.algorithm</code> | set to overwrite hashing algorithm defined in the UbirchVerification constructor's <code>algorithm</code> field |
| <code>leaveUntouched</code> | boolean  |              | <code>false</code> | optional parameter, set it to `true` if the JSON needs to be hashed as it is without trimming and sorting recursively |

#### Format JSON: formatJSON(json: string, sort = true): string

This little helper method is used inside of `createHash(json)` to prepare the given JSON.
It is made available as public method so that you can see which JSON string is really hashed for the anchoring to make sure 
that it looks like expected.

It trims the JSON, because a JSON string with additional empty spaces will result in a different hash.
And it sorts the keys recursively. If sort should not happen, the second parameter needs to be set to `false`.

```ts
const trimedJson = ubirchVerification.formatJSON(json, false);
```

| Attribute         | Type    | Values       |  Default      | Description                                                    |
| ----------------  | ------- | -----------  | -----------   | -------------------------------------------------------------- |
| <code>json</code> | string  |              | **REQUIRED** | Data in JSON Format that shall prepared.                        |
| <code>sort</code> | boolean  |              | <code>true</code> | optional parameter, set it to `false` if the JSON shall not be sorted |

#### Subscribe to Messenger: get messenger(): Observable<UbirchMessage>

You can subscribe to the `messenger` Observable to get informed about:

* the currently performed step(s)
* errors that have occurred
* verification results

```ts
if (!subscription) subscription = ubirchVerificationWidget.messenger.subscribe((msg) => {
    console.log(msg);
    (document.getElementById('log') as HTMLInputElement).value += JSON.stringify(msg, null, 2) + '\n\n';
});
```

#### Change Language on Runtime: <code>setLanguage(language: ELanguages)</code>

During initialisation of the UbirchVerification you can set the language of the result of the verification on runtime.
If you want to change the used language on runtime you can call `setLanguage`:

```ts
ubirchVerification.setLanguage('en');
```

| Attribute                | Type    | Values       |  Default      | Description                                                    |
| ------------------------ | ------- | -----------  | -----------   | -------------------------------------------------------------- |
| <code>language</code>    | String  | 'de', 'en'   | **REQUIRED**  | language key to change language of the verification result strings to at runtime |

----------

### UI Widget for Verification Result: <code>UbirchVerificationWidget</code>

The **UbirchVerificationWidget** is an extension of the UbirchVerification class,
showing the result of the verification in a simple UI, that can be included into your website.

#### Add `DIV` Tag for Widget to your HTML Page

You need to insert a `DIV` tag into you HTML page, in which the widget elements can be inserted dynamically.
Give it an id that you pass as `hostSelector` parameter in the `UbirchVerificationWidget` constructor.

```html
    ...
    <div id="widget-root"></div>
    ...
```

#### Import `UbirchVerificationWidget`

In your code import the Ubirch verification widget (form utils optional in addition)

```ts
import { UbirchVerificationWidget, UbirchFormUtils } from '@ubirch/ubirch-verification-js';
```

#### ` constructor(config: IUbirchVerificationWidgetConfig, formUtil?: IUbirchFormUtils)`

Create instance of `UbirchVerificationWidget` class with config settings.
`UbirchVerificationWidget` extends `UbirchVerification`, so the config settings are at least the same.
Additionally you need to pass the id of the `DIV` DOM element, in which the Widget will be inserted, to the new config parameter `hostSelector`.

As second optional parameter of the constructor a `FormUtil` instance, implementing the `IUbirchFormUtils` interface,  
can be provided for logging infos and errors from FormUtils.
If set the steps performed and errors that occurred during parsing URL query or fragment parameters and filling the form
will be reported through UbirchVerification.messenger additionally to verification messages.

```ts
const ubirchVerificationWidget = new ubirchVerificationWidget({
  accessToken: 'eya1s2d3f4g5h6j7k8...',
  algorithm: 'sha512',
  state: 'demo',
  language: 'en',
  hostSelector: '#widget-root'
});
```

##### config settings:

| Attribute                | Type    | Values       |  Default      | Description                                                    |
| ------------------------ | ------- | -----------  | -----------   | -------------------------------------------------------------- |
| <code>accessToken</code> | string  |              | **REQUIRED**  | is a UBIRCH verification token. You can create verification tokens for your things in the [ubirch-console](https://console.prod.ubirch.com). If you anchored data through one of your things you need to add the token created for verification of this thing to the UbirchVerification here.                                       |
| <code>hostSelector</code> | String  | '#<DIV_ID>' | **REQUIRED**  | id of the `DIV` DOM element, in which the Widget will be inserted; starting with an `#` |
| <code>algorithm</code>   | String  | 'sha256', 'sha512' | 'sha256' | hashing algorithm used during anchoring of your data          |
| <code>stage</code>       | String  | 'dev, demo, 'qa', 'prod' | 'prod' |optional param to set UBRICH stage against which UbirchVerification tries to verify |
| <code>language</code>    | String  | 'de', 'en'   | 'de'          | optional param to set language of widget strings                               |
| <code>linkToConsole</code> | boolean |            | <code>false</code> | optional param to activate the link from ubirch seal icon to ubirch console verification page with detailed information about verification |
| <code>openConsoleInSameTarget</code> | boolean |  | <code>false</code> | optional param - only relevant if `linkToConsole` is `true`. If both parameters are set to `true` the ubirch console verification page is opened in the same browser tab |

----------

### Ubirch Form Helper Utils: <code>UbirchFormUtils</code>

For convenience, you can use <code>UbirchFormUtils</code> for a verification based on a form with input fields.
It's also part of the `ubirch-verification-js`. and provides the following functionality:

* get params as string from fragment OR - if no fragment set - from query of url
* insert params into form fields
* check if form fields are filled
* Create JSON from input fields

#### create form

Create a form on the HTML page with input fields for the params of the verification document.
For every required param define an input field; set the key of the param from the JSON data structure as id of the input:

Example:

```tson
{"did":"1a0dca1f-caf8-4776-bda9-909b4d9b6b1f","fn":"Max","ln":"Mustermann","d":"2019-06-12"}
```

```html
<div class="input-field">
  <input type="text" id="did">
  <label for="did">DocumentID:</label>
</div>
<div class="input-field">
  <input type="text" id="fn">
  <label for="fn">Firstname:</label>
</div>
<div class="input-field">
  <input type="text" id="ln">
  <label for="ln">Lastname:</label>
</div>
<div class="input-field">
  <input type="date" id="d">
  <label for="ln">Creation Date:</label>
</div>
```
#### Import `UbirchFormUtils`

In your code import the Ubirch Form Utils (normally together with the UbirchVerificationWidget)

```ts
import { UbirchVerificationWidget, UbirchFormUtils } from '@ubirch/ubirch-verification-js';
```

#### `constructor(config: IUbirchFormUtilsConfig)`

Create instance of `UbirchFormUtils` class with config settings, containing the list of used keys/ids as an array.

Sometimes it's required to have different ids used as fragment or query parameter ids than the keys in the JSON data structure,
e.g. to have a shorter url string if the used keys in the JSON structure are too long. In this case you can provide
a mapping of query/fragment params to form field ids. The parameter ids from `paramsFormIdsMapping` are mapped to the
`formIds` by the array index and `formIds` and `paramsFormIdsMapping` have to have the same length.

```ts
const formIds = ["a", "b", "c"];
const formUtils = new UbirchFormUtils({
formIds
});
```
With mapping:
```ts
const paramsFormIdsMapping  = [ "a",                    "b",                    "c"];
const formIds               = [ "myVeryLongFirstId",    "myVeryLongSecondId",   "myVeryLongThirdId"];
const formUtils = new UbirchFormUtils({
  formIds,
  paramsFormIdsMapping
});
```
##### config settings:

| Attribute                         | Type     | Values  |  Default     | Description                                                    |
| --------------------------------- | -------  | ------- | -----------  | -------------------------------------------------------------- |
| <code>formIds</code>              | string[] |         | **REQUIRED** | string array with param ids used in the anchored JSON; here the id's can be added in any order; **Attention**: in the anchored JSON document the id's should be in alphabetical order! (see section about <code>formatJson</code>); **Attention**: avoid using the id "id" (e.g. TYPO3 uses this id for routing and ignores query string if it contains an id "id") |
| <code>paramsFormIdsMapping</code> | string[] |         |              | optional param, used if query/fragment params need to be mapped on form field ids e.g. because the keys used in the JSON structure are very long |

UbirchFormUtils implements IUbirchFormUtils and provides a messenger Observable.
If you use `UbirchVerificationWidget` together with `IUbirchFormUtils`, you can add the instance as second parameter of 
the constructor of `UbirchVerificationWidget`. If set the steps performed and errors that occurred during parsing URL
query or fragment parameters and handling the form will be reported through UbirchVerification.messenger additionally
to verification messages.

#### get params from fragment OR query of url: <code>getFormParamsFromUrl = (windowRef: Window, separator: string): DataParams</code>

* Tries to read params from curl as a string
* IF fragment is given the params are read from fragment
* IF NO fragment is given the params are tried to be read from query string
* pattern:
  <code>IDNAME1=PARAMVALUE1&IDNAME2=PARAMVALUE2&...</code>

The first parameter is required and is the window reference to get the location url from.

The second parameter is optional and needs to be set if not the default separator for fragment or query parameters is used.
Default is "," but this can lead into problems if normal text - possibly containing commas - has been anchored.
As separator the whole string is searched in the fragment or query of the url, so you can e.g. define "%SEP%" as the separator between params.
Default is "&" which is the normal separator for query params.

    const paramStr = "pid=9ceb5551-d006-4648-8cf7-c7b1a1ddccb1;tid=FGXC-CL11-KDKC-P9XC-74MM;td=2020-06-12;tt=11:00:00;tr=negativ";
    ubirchFormVerification.setDataIntoForm(paramStr, document, ';');

It returns the parameters read:

```ts
var paramStr = formUtils.getFormParamsFromUrl(window, ';');
```

#### Insert params into form: <code>setDataIntoForm(params: DataParams, documentRef: Document)</code>

If you want to insert given params read from url (OR test data as string) into form fields call <code>setDataIntoForm</code>:

```ts
const paramStr = "pid=9ceb5551-d006-4648-8cf7-c7b1a1ddccb1&tid=FGXC-CL11-KDKC-P9XC-74MM&td=2020-06-12&tt=11:00:00&tr=negativ";
ubirchFormVerification.setDataIntoForm(paramStr, document);
```
