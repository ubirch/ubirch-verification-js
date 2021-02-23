"use strict";

import { EError, EHashAlgorithms, IUbirchVerificationConfig } from './models';
import { UbirchVerification } from './verification';

const defaultSettings: IUbirchVerificationConfig = {
  algorithm: EHashAlgorithms.SHA256,
  accessToken: 'dummy_test_token'
}

describe("Verification", () => {

  describe("formatJSON", () => {

    test('should simply sort JSON params', () => {
      const verifier = new UbirchVerification(defaultSettings);
      const jsonString = '{"b":"2","a":"1"}';
      const result = verifier.formatJSON(jsonString, true);
      expect(result).toEqual('{"a":"1","b":"2"}');
    });

    test('should trim JSON params', () => {
      const verifier = new UbirchVerification(defaultSettings);
      const jsonString = '{"b": "2", "c": "A", "a": "-1"}';
      const result = verifier.formatJSON(jsonString, true);
      expect(result).toEqual('{"a":"-1","b":"2","c":"A"}');
    });

    test('should sort JSON params recursively', () => {
      const verifier = new UbirchVerification(defaultSettings);
      const jsonString = '{"b": "2", "x": { "1": "hallo", "3": "bello", "2": {"A": "x", "B": "xx"}}, "a": "-1"}';
      const result = verifier.formatJSON(jsonString, true);
      expect(result).toEqual('{"a":"-1","b":"2","x":{"1":"hallo","2":{"A":"x","B":"xx"},"3":"bello"}}');
    });

    test('should NOT sort arrays as JSON params', () => {
      const verifier = new UbirchVerification(defaultSettings);
      const jsonString = '{"a": [6, 4, 9]}';
      const result = verifier.formatJSON(jsonString, true);
      expect(result).toEqual('{"a":[6,4,9]}');
    });

    test('should NOT change number params to string', () => {
      const verifier = new UbirchVerification(defaultSettings);
      const jsonString = '{"b": "2", "a": -1}';
      const result = verifier.formatJSON(jsonString, true);
      expect(result).toEqual('{"a":-1,"b":"2"}');
    });

    test('should NOT change special characters in params', () => {
      const verifier = new UbirchVerification(defaultSettings);
      const jsonString: string = '{"g":"äöüÄÖÜß","p":"!§$%&/()=?*+#_-:.;","r":"®","a":"\\n"}';
      const result = verifier.formatJSON(jsonString, true);
      expect(result).toEqual('{"a":"\\n","g":"äöüÄÖÜß","p":"!§$%&/()=?*+#_-:.;","r":"®"}');
    });

    test('should throw an error if the json is malformed', () => {
      const verifier = new UbirchVerification(defaultSettings);
      const jsonString = '"a":"-1"';
      expect(() => verifier.formatJSON(jsonString, true)).toThrow("Building internal JSON format from input string failed");
    });
  });

  describe("createHash", () => {

    test('should create a correct sha256 hash from json data', () => {
      const verifier = new UbirchVerification(defaultSettings);
      const trimmedAndSortedJson = '{"a":"-1","b":"2","x":{"1":"hallo","2":{"A":"x","B":"xx"},"3":"bello"}}';
      const result = verifier.createHash(trimmedAndSortedJson);
      expect(result).toEqual('9LrnCLgPcUiQpM+YabkmW/BhT7/9R7TssIBrX6zUXs8=');
    });

    test('should create a correct sha512 hash from json data', () => {
      const verifier = new UbirchVerification(defaultSettings);
      const trimmedAndSortedJson = '{"a":"-1","b":"2","x":{"1":"hallo","2":{"A":"x","B":"xx"},"3":"bello"}}';
      const result = verifier.createHash(trimmedAndSortedJson, EHashAlgorithms.SHA512);
      expect(result).toEqual('l5y7KYeeAmASU76WhTsOfy4+L/o+r1LHg1Uqv/rClxgivyveUAJo/WCwZTsfBaK54zg4MKs08serUXKuFQgu+A==');
    });

  });
});
