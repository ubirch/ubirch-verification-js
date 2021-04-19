'use strict';

import { toArray } from 'rxjs/operators';
import * as verifyResult from '../test/testdata/verifyresult.json';
import {
  EError,
  EHashAlgorithms, EInfo,
  EStages,
  EUppStates,
  EVerificationState,
  IUbirchBlockchainAnchor,
  IUbirchError,
  IUbirchInfo,
  IUbirchVerificationConfig,
  IUbirchVerificationResult,
} from './models';
import { UbirchVerification } from './verification';

const defaultSettings: IUbirchVerificationConfig = {
  algorithm: EHashAlgorithms.SHA256,
  accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2VuLmRldi51YmlyY2guY29tIiwic3ViIjoiZDYzZWNjMDMtZjVhNy00ZDQzLTkxZDAtYTMwZDAzNGQ4ZGEzIiwiYXVkIjoiaHR0cHM6Ly92ZXJpZnkuZGV2LnViaXJjaC5jb20iLCJleHAiOjE2MTk4MjA2MzAsImlhdCI6MTYxMjQzNTI4MCwianRpIjoiOGJkMzExZDItZGEyYi00ZWJhLWExMmMtODYxYjRiYWU2MjliIiwidGFyZ2V0X2lkZW50aXRpZXMiOiIqIiwicm9sZSI6InZlcmlmaWVyIiwic2NvcGUiOiJ2ZXIiLCJwdXJwb3NlIjoiVWJpcmNoIERlZmF1bHQgVG9rZW4iLCJvcmlnaW5fZG9tYWlucyI6W119.tDovGseqjwaJZNX0ZtoGmZVvkcdVltR1nXYYAFpF4DHGAQ8MiRAfeJIYL0TNHsqBt_-60fw2j65neje_ThJ7Eg',
  stage: EStages.dev,
};

class UbirchVerificationMock extends UbirchVerification {
  constructor(config: IUbirchVerificationConfig) {
    super(config);
  }

  public sendVerificationRequest(hash: string): Promise<any> {
    return super.sendVerificationRequest(hash);
  }
}

describe('Verification', () => {

  describe('formatJSON', () => {

    test('should simply sort JSON params', () => {
      const verifier = new UbirchVerificationMock(defaultSettings);
      const jsonString = '{"b":"2","a":"1"}';
      const result = verifier.formatJSON(jsonString, true);
      expect(result).toEqual('{"a":"1","b":"2"}');
    });

    test('should trim JSON params', () => {
      const verifier = new UbirchVerificationMock(defaultSettings);
      const jsonString = '{"b": "2", "c": "A", "a": "-1"}';
      const result = verifier.formatJSON(jsonString, true);
      expect(result).toEqual('{"a":"-1","b":"2","c":"A"}');
    });

    test('should sort JSON params recursively', () => {
      const verifier = new UbirchVerificationMock(defaultSettings);
      const jsonString = '{"b": "2", "x": { "1": "hallo", "3": "bello", "2": {"A": "x", "B": "xx"}}, "a": "-1"}';
      const result = verifier.formatJSON(jsonString, true);
      expect(result).toEqual('{"a":"-1","b":"2","x":{"1":"hallo","2":{"A":"x","B":"xx"},"3":"bello"}}');
    });

    test('should NOT sort arrays as JSON params', () => {
      const verifier = new UbirchVerificationMock(defaultSettings);
      const jsonString = '{"a": [6, 4, 9]}';
      const result = verifier.formatJSON(jsonString, true);
      expect(result).toEqual('{"a":[6,4,9]}');
    });

    test('should NOT change number params to string', () => {
      const verifier = new UbirchVerificationMock(defaultSettings);
      const jsonString = '{"b": "2", "a": -1}';
      const result = verifier.formatJSON(jsonString, true);
      expect(result).toEqual('{"a":-1,"b":"2"}');
    });

    test('should NOT change special characters in params', () => {
      const verifier = new UbirchVerificationMock(defaultSettings);
      const jsonString: string = '{"g":"äöüÄÖÜß","p":"!§$%&/()=?*+#_-:.;","r":"®","a":"\\n"}';
      const result = verifier.formatJSON(jsonString, true);
      expect(result).toEqual('{"a":"\\n","g":"äöüÄÖÜß","p":"!§$%&/()=?*+#_-:.;","r":"®"}');
    });

    test('should throw an error if the json is malformed', () => {
      const verifier = new UbirchVerificationMock(defaultSettings);
      const jsonString = '"a":"-1"';
      expect(() => verifier.formatJSON(jsonString, true)).toThrow('Building internal JSON format from input string failed');
    });
  });

  describe('createHash', () => {

    test('should create a correct sha256 hash from json data', () => {
      const verifier = new UbirchVerificationMock(defaultSettings);
      const trimmedAndSortedJson = '{"a":"-1","b":"2","x":{"1":"hallo","2":{"A":"x","B":"xx"},"3":"bello"}}';
      const result = verifier.createHash(trimmedAndSortedJson);
      expect(result).toEqual('9LrnCLgPcUiQpM+YabkmW/BhT7/9R7TssIBrX6zUXs8=');
    });

    test('should create a correct sha512 hash from json data', () => {
      const verifier = new UbirchVerificationMock(defaultSettings);
      const trimmedAndSortedJson = '{"a":"-1","b":"2","x":{"1":"hallo","2":{"A":"x","B":"xx"},"3":"bello"}}';
      const result = verifier.createHash(trimmedAndSortedJson, EHashAlgorithms.SHA512);
      expect(result).toEqual('l5y7KYeeAmASU76WhTsOfy4+L/o+r1LHg1Uqv/rClxgivyveUAJo/WCwZTsfBaK54zg4MKs08serUXKuFQgu+A==');
    });

  });

  describe('sendVerificationRequest', () => {

    test('should send the hash successfully and return a VERIFICATION_PARTLY_SUCCESSFUL response', () => {

      const verifier = new UbirchVerificationMock(defaultSettings);
      const testhash_verifiable = 'EZ3KK48ShoOeHLuNVv+1IjguEhwVruSD2iY3aePJm+8=';
      const responseJSON: string = '{"anchors":{"upper_blockchains":[]},"prev":"","upp":"upp-must-not-be-null"}';

      jest.spyOn(UbirchVerificationMock.prototype, 'sendVerificationRequest')
        .mockImplementation(_ => Promise.resolve(responseJSON));

      return verifier.verifyHash(testhash_verifiable).then((response: IUbirchVerificationResult) => {
        expect(response).toBeDefined();
        expect(response.upp).toBeDefined();
        expect(response.upp.state).toBe(EUppStates.created);
        expect(response.verificationState).toBe(EVerificationState.VERIFICATION_PARTLY_SUCCESSFUL);
        expect(response.failReason).toBeUndefined();
      });

    });

    test('should handle error if CERTIFICATE_ID_CANNOT_BE_FOUND', () => {

      const verifier = new UbirchVerificationMock(defaultSettings);
      const testhash_verifiable = 'EZ3KK48ShoOeHLuNVv+1IjguEhwVruSD2iY3aePJm+8=';
      const error: IUbirchError = { code: EError.CERTIFICATE_ID_CANNOT_BE_FOUND, message: 'message for CERTIFICATE_ID_CANNOT_BE_FOUND' };

      jest.spyOn(UbirchVerificationMock.prototype, 'sendVerificationRequest')
        .mockImplementation(_ => Promise.reject(error));

      return verifier.verifyHash(testhash_verifiable)
        .catch((errResponse: IUbirchVerificationResult) => {
          expect(errResponse).toBeDefined();
          expect(errResponse.verificationState).toBe(EVerificationState.VERIFICATION_FAILED);
          expect(errResponse.failReason).toBe(error.code);
        });

    });
    test('should fail with VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE if no upp is returned', () => {

      const verifier = new UbirchVerificationMock(defaultSettings);
      const testhash_verifiable = 'EZ3KK48ShoOeHLuNVv+1IjguEhwVruSD2iY3aePJm+8=';
      const responseJSON: string = '{"anchors":{"upper_blockchains":[]},"prev":"","upp":""}';

      jest.spyOn(UbirchVerificationMock.prototype, 'sendVerificationRequest')
        .mockImplementation(_ => Promise.resolve(responseJSON));

      return verifier.verifyHash(testhash_verifiable)
        .catch((errResponse: IUbirchVerificationResult) => {
          expect(errResponse).toBeDefined();
          expect(errResponse.verificationState).toBe(EVerificationState.VERIFICATION_FAILED);
          expect(errResponse.failReason).toBe(EError.VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE);
        });
    });

    test('should send the hash successfully and return a VERIFICATION_SUCCESSFUL response', () => {

      const verifier = new UbirchVerificationMock(defaultSettings);
      const testhash_verifiable = 'EZ3KK48ShoOeHLuNVv+1IjguEhwVruSD2iY3aePJm+8=';
      const response: string = JSON.stringify(verifyResult);

      jest.spyOn(UbirchVerificationMock.prototype, 'sendVerificationRequest')
        .mockImplementation(_ => Promise.resolve(response));

      return verifier.verifyHash(testhash_verifiable).then((response: IUbirchVerificationResult) => {
        expect(response).toBeDefined();
        expect(response.upp).toBeDefined();
        expect(response.upp.state).toBe(EUppStates.anchored);
        expect(response.verificationState).toBe(EVerificationState.VERIFICATION_SUCCESSFUL);
        expect(response.anchors).toBeDefined();
        expect(response.anchors.length).toBeGreaterThan(0);

        const firstAnchor: IUbirchBlockchainAnchor = response.anchors[ 0 ];
        expect(firstAnchor.blxTxExplorerUrl).toBeDefined();
        expect(firstAnchor.iconUrl).toBeDefined();
        expect(firstAnchor.label).toBeDefined();
        expect(firstAnchor.networkInfo).toBeDefined();
        expect(firstAnchor.networkType).toBeDefined();
        expect(firstAnchor.timestamp).toBeDefined();
        expect(firstAnchor.txid).toBeDefined();
        expect(firstAnchor.raw).toBeDefined();

        expect(response.failReason).toBeUndefined();
      });

    });

    test('that watchInfosAndErrors observable is called', done => {

      const verifier = new UbirchVerificationMock(defaultSettings);
      const testhash_verifiable = 'EZ3KK48ShoOeHLuNVv+1IjguEhwVruSD2iY3aePJm+8=';
      const response: string = JSON.stringify(verifyResult);
      const watcher$ = verifier.watchInfosAndErrors();

      let infoCounter: number = 0;
      const infoChain = [
        EInfo.START_VERIFICATION_CALL,
        EInfo.START_CHECKING_RESPONSE,
        EInfo.RESPONSE_JSON_PARSED_SUCCESSFUL,
        EInfo.UPP_HAS_BEEN_FOUND,
        EInfo.BLXTXS_FOUND_SUCCESS,
        EVerificationState.VERIFICATION_SUCCESSFUL];

      watcher$.subscribe((info: (IUbirchError | IUbirchInfo)) => {
        if (info !== null) {
          expect(info.code).toEqual(infoChain[infoCounter]);
          infoCounter++;
          done();
        }
      });

      jest.spyOn(UbirchVerificationMock.prototype, 'sendVerificationRequest')
        .mockImplementation(_ => Promise.resolve(response));

      verifier.verifyHash(testhash_verifiable).then(_ => infoCounter === infoChain.length ? done() : done('finished without expected info messages'));
    });
  });
});
