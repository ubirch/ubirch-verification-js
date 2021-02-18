"use strict";

import { UbirchVerification } from './verification';
const assert = require('assert');

describe("Verification", () => {

  describe("formatJSON", () => {

    it('should simply sort JSON params', () => {
      const verifier = new UbirchVerification();
      const jsonString = '{"b":"2","a":"1"}';
      const result = verifier.formatJSON(jsonString, true);
      assert.strictEqual(result,'{"a":"1","b":"2"}', `${jsonString} -> ${result}`);
    });

    it('should trim JSON params', () => {
      const verifier = new UbirchVerification();
      const jsonString = '{"b": "2", "c": "A", "a": "-1"}';
      const result = verifier.formatJSON(jsonString, true);
      assert.strictEqual(verifier.formatJSON(jsonString, true),'{"a":"-1","b":"2","c":"A"}', `${jsonString} -> ${result}`);
    });

    it('should sort JSON params recursively', () => {
      const verifier = new UbirchVerification();
      const jsonString = '{"b": "2", "x": { "1": "hallo", "3": "bello", "2": {"A": "x", "B": "xx"}}, "a": "-1"}';
      const result = verifier.formatJSON(jsonString, true);
      assert.strictEqual(verifier.formatJSON(jsonString, true),'{"a":"-1","b":"2","x":{"1":"hallo","2":{"A":"x","B":"xx"},"3":"bello"}}', `${jsonString} -> ${result}`);
    });

    it('should NOT sort arrays as JSON params', () => {
      const verifier = new UbirchVerification();
      const jsonString = '{"a": [6, 4, 9]}';
      const result = verifier.formatJSON(jsonString, true);
      assert.strictEqual(verifier.formatJSON(jsonString, true),'{"a":[6,4,9]}', `${jsonString} -> ${result}`);
    });

    it('should NOT change number params to string', () => {
      const verifier = new UbirchVerification();
      const jsonString = '{"b": "2", "a": -1}';
      const result = verifier.formatJSON(jsonString, true);
      assert.strictEqual(verifier.formatJSON(jsonString, true),'{"a":-1,"b":"2"}', `${jsonString} -> ${result}`);
    });

    it('should NOT change special characters in params', () => {
      const verifier = new UbirchVerification();
      const jsonString: string = '{"g":"äöüÄÖÜß","p":"!§$%&/()=?*+#_-:.;","r":"®","a":"\\n"}';
      const result = verifier.formatJSON(jsonString, true);
      assert.strictEqual(verifier.formatJSON(jsonString, true),'{"a":"\\n","g":"äöüÄÖÜß","p":"!§$%&/()=?*+#_-:.;","r":"®"}', `${jsonString} -> ${result}`);
    });

  });
});
