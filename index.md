# ubirch-verification-js

**ATTENTION!!!! This Page is WORK-IN-PROGRESS!!!!**


JavaScript package to verify that data has been anchored by UBIRCH in a trustworthy way. It checks that the data has been anchored as a
UPP (UBIRCH Package Protocol) in blockchains by the UBIRCH Certification System.

## Usage

### From NPM registry

```
    npm i @ubirch/ubirch-verification-js js-sha256 js-sha512
    // or using Yarn
    yarn add @ubirch/ubirch-verification-js js-sha256 js-sha512
```
A working example can be found in the Repository [ubirch-verify-widget](https://github.com/ubirch/ubirch-verify-widget)


The UbirchVerification package consists of three parts:

* **UbirchVerification** - contains the core functionality of verifying hashes or JSON against the UBIRCH system
* **UbirchVerificationWidget** - a Widget, that can be included into your website, showing the result of the verification in a simple UI
* **UbirchFormUtils** - helper tool to handle forms and URL query/fragment parameters to display the verified data easily

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

## API

### <code>UbirchVerification</code>

* To use the core functionality to verify hashes against the UBIRCH system without any UI import and use UbirchVerification:

```js
import { UbirchVerification } from '@ubirch/ubirch-verification-js';
```

#### `constructor(config: IUbirchVerificationConfig, formUtil?: IUbirchFormUtils)`

Create instance of `UbirchVerification` class with config settings.
As second optional parameter a `FormUtil` instance can be provided for logging infos and errors.

    const ubirchVerification = new UbirchVerification({
        accessToken: {{ UBIRCH verification token }},
        algorithm?: {{ sha algorithm }},
        state?: {{ UBIRCH deployment stage }},
        language?: {{ language shortcut for result }},
    });

##### config settings:

| Attribute            | Type    | Values       |  Default      | Description                                                    |
| -------------------- | ------- | -----------  | -----------   | -------------------------------------------------------------- |
| accessToken          | string  |              | **REQUIRED** | is a UBIRCH verification token. You can create verification tokens for your things in the [ubirch-console](https://console.prod.ubirch.com). If you anchored data through one of your things you need to add the token created for verification of this thing to the UbirchVerification here.                                       |
| algorithm            | String  | 'sha256', 'sha512' | 'sha256' | hashing algorithm used during anchoring of your data          |
| stage                | String  | 'dev, demo, 'qa', 'prod' | 'prod'  |optional param to set UBRICH stage against which UbirchVerification tries to verify |
| language             | String  | 'de', 'en'  |  optional param to set language of widget strings                               |

* <code>accessToken</code>
  - string - REQUIRED
  - is a UBIRCH verification token. You can create verification tokens for your things
    in the [ubirch-console](https://console.prod.ubirch.com). If you anchored data through one of your things you need to
    add the token created for verification of this thing to the UbirchVerification here.
* <code>algorithm</code>
    - string - OPTIONAL
    - hashing algorithm used during anchoring of your data
    - possible values: <code>'sha256'</code> | <code>sha512</code>
    - default: <code>'sha256'</code>
* <code>stage</code>
  - string - OPTIONAL
  - optional param to set UBRICH stage against which UbirchVerification tries to verify
  - values: <code>'dev'</code>| <code>'demo'</code>| <code>'prod'</code>| <code>'qa'</code>; 
  - default stage: <code>'prod'</code>
* <code>language</code>
  - string - OPTIONAL
  - optional param to set language of widget strings
  - values: <code>'de'</code>| <code>'en'</code>
  - default stage: <code>'de'</code>

Create instance of `UbirchVerification` class with given config:
As second optional parameter a `FormUtil` instance can be provided for logging infos and errors.

### Verify JSON

If you have the anchored JSON (generated yourself or by using <code>createJsonFromInputs</code>, see below)
you can verify the JSON by

    verifyJSON( {{ your JSON }} )

Hint: the params of the JSON do not need to be alphabetically ordered here,
but before hashing the JSON they will be ordered and trimmed.

So, if you anchor a document manually be sure to ordered the params in the JSON alphabetically
and remove all spaces.

Hint: historically some things are anchored in a JSON without alphabetically ordered params.
In this case structure the JSON as it is anchored and call it with optional sort param:

    verifyJSON( {{ your JSON }}, false )


### Verify hash

You can verify the hashed JSON directly by

    verifyHash( {{ your hash }} )

Attention: use the hashing algorithm defined in the UbirchVerification constructor's <code>algorithm</code> field

### Helper: Sort and trim JSON

Helper function to sort (recursively, if not prevented) and trim JSON

    ubirchVerification.formatJSON( {{ jsonStr JSON }}, {{ sortorder boolean = true }});

Where:
* <code>jsonStr</code> is the JSON e.g. in prettyprint format and keys in any order
* <code>sortorder</code> Optional! Default: true; set to false if the keys should not be sorted (recursively)

THis function is called from verifyJSON.
This call can be used for debugging or testing to check which string is generated from given JSON data
before hashing and verifying.

### Generate hash from JSON

Helper function to generate hash from JSON (for debugging or testing).

    ubirchVerification.createHash( {{ jsonStr JSON }} );

Before hashing the params of the JSON will be ordered and trimmed by calling <code>ubirchVerification.formatJSON</code>.
Then the JSON will be hashed with the hash algorithm defined in
ubirchVerification constructor's <code>algorithm</code> field

### Set text message

Beneath setting the language of the widget you can set an individual message:

    ubirchVerification.setMessageString( {{ key }}, {{ info text }}, {{ header (optional) }} )

Example:

      ubirchVerification.setMessageString('FAIL',
        'No blockchain anchor for given data\nPlease check your inserted data', 'Verification Failed!');

Keys:

* PENDING
* SUCCESS
* FAIL
* CERTIFICATE_DATA_MISSING
* VERIFICATION_FAILED
* CERTIFICATE_ID_CANNOT_BE_FOUND
* VERIFICATION_FAILED_EMPTY_RESPONSE
* VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE
* UNKNOWN_ERROR

## Ubirch Form Verification

There is a convenient SubClass ubirchFormVerification for a verification based on a form with input fields.
It's also part of the verification.js lib.
It provides following functionality:

* get params as string from fragment OR - if no fragment set - from query of url
* insert params into form fields
* check if form fields are filled
* Create JSON certificate from form fields

### Insert verification.js

Same as for UbirchVerification widget

### Create a <code>UbirchFormVerification</code> instance

    const ubirchFormVerification = new UbirchFormVerification({
      algorithm: 'sha512',
      elementSelector: '#verification-widget',
      state: 'demo',  // OTIONAL!!
      language: 'en',  // OPTIONAL!!
      HIGHLIGHT_PAGE_AFTER_VERIFICATION: true  // OPTIONAL!!

      formIds: ["pid", "tid", "td", "tt", "tr"]
      paramsFormIdsMapping: ["probenId", "testId", "testDate", "testTime", "testResult"],  // OPTIONAL!!
      CHECK_FORM_FILLED: false  // OPTIONAL!!
    });

Params:

Same as for UbirchVerification widget. Additional:

* <code>formIds</code> string array with param ids used in the anchored JSON
  - here the id's can be added in any order; attention: in the anchored JSON document the id's have to be in alphabetical order!
  - attention: you must not use id "id" (TYPO3 uses this id for routing and ignores query string if it contains an id "id")

* <code>paramsFormIdsMapping</code> optional param, used if query/fragment params need to be mapped on form field ids
  - historical reasons e.g. needed if form is called from a QR code with url params for the form
    BUT the param names are different from the JSON params that are anchored
  - the formIds are mapped to the paramsFormIdsMapping at the array index ->
    formIds and paramsFormIdsMapping have to have the same length

* <code>CHECK_FORM_FILLED</code> optional param
  - default: true; if NOT set the form is checked for that all fields are filled and verification is not processed
    and user gets informed about the missing fields
  - if set to false no check is performed and verification is processed with incomplete data

### create form

Create a form on the page with input fields for the params of the verification document.
For every required param define an input field; set the param id as id of the input:

Example:

    {"did":"1a0dca1f-caf8-4776-bda9-909b4d9b6b1f","fn":"Max","ln":"Mustermann","d":"2019-06-12","v":"3.25"}


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
    ...

### get params from fragment OR query of url (optional)

* Tries to read params from curl as a string
* IF fragment is given the params are read from fragment
* IF NO fragment is given the params are tried be read from query string
* pattern:
  <code>IDNAME1=PARAMVALUE1&IDNAME2=PARAMVALUE2&...</code>

Call:

        var paramStr = ubirchFormVerification.getFormParamsFromUrl(window);

### Insert params into form (optional)

If you want to insert given params (test data as string OR read from url) into form fields you can call <code>setDataIntoForm</code>:

    const paramStr = "pid=9ceb5551-d006-4648-8cf7-c7b1a1ddccb1&tid=FGXC-CL11-KDKC-P9XC-74MM&td=2020-06-12&tt=11:00:00&tr=negativ";
    ubirchFormVerification.setDataIntoForm(paramStr, document);

You can add an optional parameter to define the separator e.g. if you get params from fragment.
The whole string is search in the paramStr, so you can e.g. define "%SEP%" as the separator between params.
Default is "&" which is the normal separator for query params.

    const paramStr = "pid=9ceb5551-d006-4648-8cf7-c7b1a1ddccb1;tid=FGXC-CL11-KDKC-P9XC-74MM;td=2020-06-12;tt=11:00:00;tr=negativ";
    ubirchFormVerification.setDataIntoForm(paramStr, document, ';');

In addition if your call contains normal text - possibly containing commas -
please set the second optional parameter to define a custom separator to divide array elements given in the url query or fragment;
default is "," but this can lead into problems if normal text - possibly containing commas - has been anchored

    ubirchFormVerification.setDataIntoForm(paramStr, document, ';', '%NXT%');

### Generate JSON from input fields

If you have a form with input fields for all params you can create the JSON document by calling
<code>getJsonFromInputs</code>.

* in the created JSON all params are put together that are defined in constructors
  <code>formIds</code> parameter
* the values are taken from the input fields with the same id
* checks if form is filled completely; throws an <code>IUbirchFormError</code>, if any fields are empty
* <code>IUbirchFormError.missingIds</code> contains a list of all missing ids
* handle the error yourself and inform user about the missing fields
* if no error occurs the created JSON is returned;
  then you can verify the JSON by <code>verifyJSON</code> in a separate step.


        try {

          const genJson = ubirchFormVerification.getJsonFromInputs(document);
          ubirchFormVerification.verifyJSON( genJson );

        } catch (e) {
            e.missingIds.forEach(
                id => // handle missing field
            );
        }


## Widget Configuration

### Environment Settings

In the environments the following settings should be set:

- `verify_api_url` - Server URL for the verification request for every stage (local, dev, demo, prod)
- `console_verify_url` - Server URL to open details in the console web app verification page for every stage (local, dev, demo, prod)

### How To Add New Blockchains

1. Add new Blockchain settings to the `blockchain-assets/blockchain-settings.json`:


    "new-blx-name": {
      "nodeIcon": "new-blx_verify_right.png",
      "explorerUrl": {
         "testnet": {
           "url": "https://blockexplorer.new-blx-name.org/tx/path-to-testnet"
         },
         "mainnet": {
           "url": "https://blockexplorer.new-blx-name.org/tx/path-to-mainnet"
         }
       }
    },

2. Add new Blockchain icon to the folder `blockchain-assets/blockchain-icons`
3. Add require statement for the new Blockchain icon in the index.ts:


    const icons: Map<string, any> = new Map([
      ['ubirch_verify_right.png', require('../blockchain-assets/blockchain-icons/ubirch_verify_right.png')],
      ['ubirch_verify_wrong.png', require('../blockchain-assets/blockchain-icons/ubirch_verify_wrong.png')],
      ...
      ['blx_verify_right.png', require('../blockchain-assets/blockchain-icons/blx_verify_right.png')],
    ]);


### UbirchVerificationWidget

Import for widget (form utils optional in addition)
```js
import { UbirchVerificationWidget, UbirchFormUtils } from '@ubirch/ubirch-verification-js';
```
### <code>UbirchVerification</code> instance

    const ubirchVerification = new UbirchVerification({
        elementSelector: {{ DIV id for widget }},
        algorithm: 'sha512',
        elementSelector: '#verification-widget',
        state: 'demo',  // OTIONAL!!
        language: 'en',  // OPTIONAL!!
        HIGHLIGHT_PAGE_AFTER_VERIFICATION: true  // OPTIONAL!!
    });


Where:
* <code>algorithm</code> is hashing algorithm you need (possible values: <code>sha256</code>, <code>sha512</code> )
* <code>elementSelector</code> is widget's host element selector (id), e.g. <code>#verification-widget</code>
* <code>stage</code> optional param to set UBRICH stage against which widget tries to verify;
  currently available: 'dev'/'demo'/'prod'/'local';
  default stage is 'prod'
* <code>language</code> optional param to set language of widget strings; currently available: 'de'/'en';
  default language is 'de'
* <code>HIGHLIGHT_PAGE_AFTER_VERIFICATION</code>
  - boolean - OPTIONAL
  - optional param, if set to true the whole page will be highlighted
    green or red for a short time interval depending on success or failure of the verification;
    done by changing the style of the <main> HTML element on the page:
    classes <code>'flashgreen'</code> or <code>'flashred'</code> - **need to be defined in css of the page!** -
    are added and removed after some seconds;
  - default: false
