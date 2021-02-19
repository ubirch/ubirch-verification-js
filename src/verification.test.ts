"use strict";

import { EHashAlgorithms } from './models';
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
      assert.strictEqual(result,'{"a":"-1","b":"2","c":"A"}', `${jsonString} -> ${result}`);
    });

    it('should sort JSON params recursively', () => {
      const verifier = new UbirchVerification();
      const jsonString = '{"b": "2", "x": { "1": "hallo", "3": "bello", "2": {"A": "x", "B": "xx"}}, "a": "-1"}';
      const result = verifier.formatJSON(jsonString, true);
      assert.strictEqual(result,'{"a":"-1","b":"2","x":{"1":"hallo","2":{"A":"x","B":"xx"},"3":"bello"}}', `${jsonString} -> ${result}`);
    });

    it('should NOT sort arrays as JSON params', () => {
      const verifier = new UbirchVerification();
      const jsonString = '{"a": [6, 4, 9]}';
      const result = verifier.formatJSON(jsonString, true);
      assert.strictEqual(result,'{"a":[6,4,9]}', `${jsonString} -> ${result}`);
    });

    it('should NOT change number params to string', () => {
      const verifier = new UbirchVerification();
      const jsonString = '{"b": "2", "a": -1}';
      const result = verifier.formatJSON(jsonString, true);
      assert.strictEqual(result,'{"a":-1,"b":"2"}', `${jsonString} -> ${result}`);
    });

    it('should NOT change special characters in params', () => {
      const verifier = new UbirchVerification();
      const jsonString: string = '{"g":"äöüÄÖÜß","p":"!§$%&/()=?*+#_-:.;","r":"®","a":"\\n"}';
      const result = verifier.formatJSON(jsonString, true);
      assert.strictEqual(result,'{"a":"\\n","g":"äöüÄÖÜß","p":"!§$%&/()=?*+#_-:.;","r":"®"}', `${jsonString} -> ${result}`);
    });

    it('should throw an error if the json is malformed', () => {
      const verifier = new UbirchVerification();
      const jsonString = '"a":"-1"';
      try {
        const result = verifier.formatJSON(jsonString, true);
        assert.fail('formatJSON did not throw an error');
      } catch (e) {
        assert.strictEqual(typeof e === 'object', true, e.message);
      }
    });
  });

  describe("createHash", () => {

    it('should create a correct sha256 hash from json data', () => {
      const verifier = new UbirchVerification();
      const trimmedAndSortedJson = '{"a":"-1","b":"2","x":{"1":"hallo","2":{"A":"x","B":"xx"},"3":"bello"}}';
      const result = verifier.createHash(trimmedAndSortedJson);
      assert.strictEqual(result,'9LrnCLgPcUiQpM+YabkmW/BhT7/9R7TssIBrX6zUXs8=', `${trimmedAndSortedJson} -> ${result}`);
    });

    it('should create a correct sha512 hash from json data', () => {
      const verifier = new UbirchVerification();
      const trimmedAndSortedJson = '{"a":"-1","b":"2","x":{"1":"hallo","2":{"A":"x","B":"xx"},"3":"bello"}}';
      const result = verifier.createHash(trimmedAndSortedJson, EHashAlgorithms.SHA512);
      assert.strictEqual(result,'l5y7KYeeAmASU76WhTsOfy4+L/o+r1LHg1Uqv/rClxgivyveUAJo/WCwZTsfBaK54zg4MKs08serUXKuFQgu+A==', `${trimmedAndSortedJson} -> ${result}`);
    });

  });
});
