import * as verifyResult from './verifyresult.json';
import * as blxProps from './blxProps.json';
import * as keyServiceResult from './keyService.json';
import UbirchProtocol from '@ubirch/ubirch-protocol-verifier/src/verify';
import {
  EError,
  EUbirchHashAlgorithms,
  EInfo,
  EUbirchStages,
  EUppStates,
  EUbirchVerificationStateKeys,
  UbirchMessage,
  IUbirchBlockchainAnchor,
  IUbirchVerificationConfig,
  IUbirchVerificationResult, EUbirchVerificationTreeNodeType,
} from '../../models/models';
import { UbirchVerification } from '../verification';

global.fetch = jest.fn();

jest.mock('@ubirch/ubirch-protocol-verifier/src/verify', () => ({
  tools: {
    upp: jest.fn().mockReturnValue('a'),
    getUUIDFromUpp: jest.fn().mockReturnValue('b'),
  },
  verify: jest.fn().mockReturnValue(true),
}));

const defaultSettings: IUbirchVerificationConfig = {
  accessToken:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2VuLmRldi51YmlyY2guY29tIiwic3ViIjoiYzBiNTc3ZmItMWNlZi00YzZmLThjNTAtOGQzYTFlNmVhNzUzIiwiYXVkIjoiaHR0cHM6Ly92ZXJpZnkuZGV2LnViaXJjaC5jb20iLCJleHAiOjE2NzI1MDQxNTgsImlhdCI6MTYzNzU5ODYzMSwianRpIjoiYTlmNTFmYzUtZTgyZi00MDczLTlhYTYtZmI3Yjk3NGViYTIzIiwic2NwIjpbInVwcDp2ZXJpZnkiXSwicHVyIjoiMjAyMiBERVYgV2lsZGNhcmQgVGVzdCBUb2tlbiIsInRncCI6W10sInRpZCI6WyIqIl0sIm9yZCI6W119.gnzzkp7eO4HtaLOG9Df7ll3-UT9Yo-pXmeRUI21e3lkJan_ju_0mC6FdDHLLgiI9nsYlQ7rmyvKHzbyaLMLYGw',
  stage: EUbirchStages.dev,
};

const prodSettings: IUbirchVerificationConfig = {
  accessToken:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2VuLnByb2QudWJpcmNoLmNvbSIsInN1YiI6IjUzYzNhMmZhLTkzMDEtNDAxOS1iM2VlLTRhOWQ4MTQyZDQzZSIsImF1ZCI6Imh0dHBzOi8vdmVyaWZ5LnByb2QudWJpcmNoLmNvbSIsImV4cCI6MTk0OTIzMzMxOSwibmJmIjoxNjMzNzAwNTIwLCJpYXQiOjE2MzM3MDA1NzksImp0aSI6IjlhNjQ1NTI2LWQ4NzEtNGQ4Yi04ODQ0LTE2MWZmMmQ0ZWZmOSIsInNjcCI6WyJ1cHA6dmVyaWZ5Il0sInB1ciI6InZlcmlmeSB3aXRoIG9yaWdpbiIsInRncCI6W10sInRpZCI6WyJjYzczOGI0Ni1mNjFiLTUwZjctMjFhMS1jMjI1NjkyMGIxYzEiXSwib3JkIjpbXX0.o2TopFB07Vu2GgvHZfurKx9gg8QVeOS7ao5j5WzIzTy_T7O3I6ZbCPWVfqlEAmISyfsbh2ENpNjbX-3UiNlpmw',
  stage: EUbirchStages.prod,
};


class UbirchVerificationMock extends UbirchVerification {
  constructor(config: IUbirchVerificationConfig) {
    super(config);
  }

  public sendVerificationRequest(hash: string): Promise<any> {
    return super.sendVerificationRequest(hash);
  }
  public log(logInfo: UbirchMessage): void {
    super.log(logInfo);
  }
}

let testhash_verifiable;
let testhash_from_complicated_device;
let verifier: UbirchVerificationMock;
let prodVerifier: UbirchVerificationMock;

const deepCopy = <T>(obj: T) => JSON.parse(JSON.stringify(obj)) as T;

describe('Verification', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear().mockReset();
    testhash_verifiable = 'EZ3KK48ShoOeHLuNVv+1IjguEhwVruSD2iY3aePJm+8=';
    testhash_from_complicated_device = 'kmoC3n84AA4Oqyhe8If5gCoQQ8fG+9JRMUST2vH8jSI=';
    verifier = new UbirchVerificationMock(defaultSettings);
    verifier.log(null);
  });

  describe('constructor', () => {
    test("should throw an error if access token isn't specified", () => {
      expect(
        () => new UbirchVerificationMock({ ...defaultSettings, accessToken: undefined })
      ).toThrow('You need to provide an accessToken to verify data');
    });
  });

  describe('formatJSON', () => {
    test('should simply sort JSON params', () => {
      const jsonString = '{"b":"2","a":"1"}';
      const result = verifier.formatJSON(jsonString);
      expect(result).toEqual('{"a":"1","b":"2"}');
    });

    test('should trim JSON params', () => {
      const jsonString = '{"b": "2", "c": "A", "a": "-1"}';
      const result = verifier.formatJSON(jsonString);
      expect(result).toEqual('{"a":"-1","b":"2","c":"A"}');
    });

    test('should sort JSON params recursively', () => {
      const jsonString =
        '{"b": "2", "x": { "1": "hallo", "3": "bello", "2": {"A": "x", "B": "xx"}}, "a": "-1"}';
      const result = verifier.formatJSON(jsonString);
      expect(result).toEqual(
        '{"a":"-1","b":"2","x":{"1":"hallo","2":{"A":"x","B":"xx"},"3":"bello"}}'
      );
    });

    test("shouldn't sort JSON params recursively", () => {
      const jsonString =
        '{"b": "2", "x": { "1": "hallo", "3": "bello", "2": {"A": "x", "B": "xx"}}, "a": "-1"}';
      const result = verifier.formatJSON(jsonString, false);
      expect(result).toEqual(
        '{"b":"2","x":{"1":"hallo","2":{"A":"x","B":"xx"},"3":"bello"},"a":"-1"}'
      );
    });

    test('should sort JSON params recursively nested in arrays', () => {
      const jsonString =
        '{"b": "2", "x": { "1": "hallo", "3": "bello", "2": [{"C": "xxx", "A": "x", "B": "xx"}]}, "a": "-1"}';
      const result = verifier.formatJSON(jsonString);
      expect(result).toEqual(
        '{"a":"-1","b":"2","x":{"1":"hallo","2":[{"A":"x","B":"xx","C":"xxx"}],"3":"bello"}}'
      );
    });

    test('should NOT sort arrays as JSON params', () => {
      const jsonString = '{"a": [6, 4, 9]}';
      const result = verifier.formatJSON(jsonString);
      expect(result).toEqual('{"a":[6,4,9]}');
    });

    test('should NOT change number params to string', () => {
      const jsonString = '{"b": "2", "a": -1}';
      const result = verifier.formatJSON(jsonString);
      expect(result).toEqual('{"a":-1,"b":"2"}');
    });

    test('should NOT change special characters in params', () => {
      const jsonString: string = '{"g":"äöüÄÖÜß","p":"!§$%&/()=?*+#_-:.;","r":"®","a":"\\n"}';
      const result = verifier.formatJSON(jsonString);
      expect(result).toEqual('{"a":"\\n","g":"äöüÄÖÜß","p":"!§$%&/()=?*+#_-:.;","r":"®"}');
    });

    test('should throw an error if the json is malformed', () => {
      const jsonString = '"a":"-1"';
      expect(() => verifier.formatJSON(jsonString)).toThrow(
        'Building internal JSON format from input string failed'
      );
    });
  });

  function checkSuccessfulVerificationCall(response: IUbirchVerificationResult) {
    expect(response).toBeDefined();
    expect(response.upp).toBeDefined();
    expect(response.upp.state).toBe(EUppStates.anchored);
    expect(response.verificationState).toBe(EUbirchVerificationStateKeys.VERIFICATION_SUCCESSFUL);
    expect(response.anchors).toBeDefined();
    expect(response.anchors).toHaveLength(3);
    expect(response.firstAnchorTimestamp).toBe('2020-10-21T10:13:16.548Z');
    expect(response.creationTimestamp).toBe('2020-10-21T10:11:02.397Z');

    const firstAnchor: IUbirchBlockchainAnchor = response.anchors[ 0 ];
    expect(firstAnchor.iconUrl).toBeDefined();
    expect(firstAnchor.label).toEqual('IOTA Mainnet Network');
    expect(firstAnchor.networkInfo).toBeDefined();
    expect(firstAnchor.networkType).toBeDefined();
    expect(firstAnchor.timestamp).toBeDefined();
    expect(firstAnchor.txid).toBeDefined();

    expect(response.failReason).toBeUndefined();
  }

  describe('createHash', () => {
    test('should create a correct sha256 hash from json data', () => {
      const trimmedAndSortedJson =
        '{"a":"-1","b":"2","x":{"1":"hallo","2":{"A":"x","B":"xx"},"3":"bello"}}';
      const result = verifier.createHash(trimmedAndSortedJson);
      expect(result).toEqual('9LrnCLgPcUiQpM+YabkmW/BhT7/9R7TssIBrX6zUXs8=');
    });

    test('should create a correct sha512 hash from json data due to parameter', () => {
      const trimmedAndSortedJson =
        '{"a":"-1","b":"2","x":{"1":"hallo","2":{"A":"x","B":"xx"},"3":"bello"}}';
      const result = verifier.createHash(trimmedAndSortedJson, EUbirchHashAlgorithms.SHA512);
      expect(result).toEqual(
        'l5y7KYeeAmASU76WhTsOfy4+L/o+r1LHg1Uqv/rClxgivyveUAJo/WCwZTsfBaK54zg4MKs08serUXKuFQgu+A=='
      );
    });
    test('should create a correct sha512 hash from json data due to config', () => {
      const verifier512 = new UbirchVerificationMock({
        ...defaultSettings,
        algorithm: EUbirchHashAlgorithms.SHA512,
      });
      const trimmedAndSortedJson =
        '{"a":"-1","b":"2","x":{"1":"hallo","2":{"A":"x","B":"xx"},"3":"bello"}}';
      const result = verifier512.createHash(trimmedAndSortedJson);
      expect(result).toEqual(
        'l5y7KYeeAmASU76WhTsOfy4+L/o+r1LHg1Uqv/rClxgivyveUAJo/WCwZTsfBaK54zg4MKs08serUXKuFQgu+A=='
      );
    });
  });

  describe('sendVerificationRequest', () => {
    test('should send the hash successfully and return a VERIFICATION_PARTLY_SUCCESSFUL response', () => {
      const responseJSON: string =
        '{"anchors":{"upper_blockchains":[]},"prev":"","upp":"upp-must-not-be-null"}';

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          json: () => JSON.parse(responseJSON),
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => keyServiceResult,
        });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((response: IUbirchVerificationResult) => {
          expect(response).toBeDefined();
          expect(response.upp).toBeDefined();
          expect(response.upp.state).toBe(EUppStates.created);
          expect(response.verificationState).toBe(
            EUbirchVerificationStateKeys.VERIFICATION_PARTLY_SUCCESSFUL
          );
          expect(response.failReason).toBeUndefined();
        });
    });

    test('should handle error if CERTIFICATE_ID_CANNOT_BE_FOUND', () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 404,
      });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((response: IUbirchVerificationResult) => {
          expect(response).toBeDefined();
          expect(response.verificationState).toBe(EUbirchVerificationStateKeys.VERIFICATION_FAILED);
          expect(response.failReason).toBe(EError.CERTIFICATE_ID_CANNOT_BE_FOUND);
        });
    });

    test('should handle error if INTERNAL_SERVER_ERROR', () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 500,
      });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((response: IUbirchVerificationResult) => {
          expect(response).toBeDefined();
          expect(response.verificationState).toBe(EUbirchVerificationStateKeys.VERIFICATION_FAILED);
          expect(response.failReason).toBe(EError.INTERNAL_SERVER_ERROR);
        });
    });

    test('should handle error if UNKNOWN_ERROR', () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 999,
      });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((response: IUbirchVerificationResult) => {
          expect(response).toBeDefined();
          expect(response.verificationState).toBe(EUbirchVerificationStateKeys.VERIFICATION_FAILED);
          expect(response.failReason).toBe(EError.UNKNOWN_ERROR);
        });
    });

    test('should handle error if VERIFICATION_UNAVAILABLE', () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('connection-error'));

      return verifier
        .verifyHash(testhash_verifiable)
        .then((response: IUbirchVerificationResult) => {
          expect(response).toBeDefined();
          expect(response.verificationState).toBe(EUbirchVerificationStateKeys.VERIFICATION_FAILED);
          expect(response.failReason).toBe(EError.VERIFICATION_UNAVAILABLE);
        });
    });

    test('should handle error if CERTIFICATE_ANCHORED_BY_NOT_AUTHORIZED_DEVICE', () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 403,
      });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((response: IUbirchVerificationResult) => {
          expect(response).toBeDefined();
          expect(response.verificationState).toBe(EUbirchVerificationStateKeys.VERIFICATION_FAILED);
          expect(response.failReason).toBe(EError.CERTIFICATE_ANCHORED_BY_NOT_AUTHORIZED_DEVICE);
        });
    });

    test('should handle bockchain anchor with ot without version property', (done) => {
      const response = deepCopy(verifyResult);
      response.anchors.upper_blockchains = deepCopy(blxProps).upper_blockchains;

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          json: () => response,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => keyServiceResult,
        });

      const infoReceived = [];
      const infoChain = [
        EUbirchVerificationStateKeys.VERIFICATION_PENDING,
        EInfo.START_VERIFICATION_CALL,
        EInfo.START_CHECKING_RESPONSE,
        EInfo.UPP_HAS_BEEN_FOUND,
        EInfo.SIGNATURE_VERIFICATION_SUCCESSFULLY,
        EInfo.BLXTXS_FOUND_SUCCESS,
        EUbirchVerificationStateKeys.VERIFICATION_SUCCESSFUL,
      ];

      const subscription = verifier.messenger.subscribe((message: UbirchMessage) => {
        if (message !== null) {
          infoReceived.push(message.code);
        }
      });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((result: IUbirchVerificationResult) => {
          expect(result).toBeDefined();
          expect(result.verificationState).toBe(EUbirchVerificationStateKeys.VERIFICATION_SUCCESSFUL);
          expect(infoReceived).toEqual(infoChain);
          expect(result.anchors).toBeDefined();
          expect(result.anchors.length).toEqual(3);
          subscription.unsubscribe();
          done();
        });

    });

    test('should handle bockchain anchor without version property (first anchor in example)', (done) => {
      const response = deepCopy(verifyResult);
      // use etherium-classic anchor -> no versions
      response.anchors.upper_blockchains = [ deepCopy(blxProps).upper_blockchains[0] ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          json: () => response,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => keyServiceResult,
        });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((result: IUbirchVerificationResult) => {
          expect(result).toBeDefined();
          expect(result.verificationState).toBe(EUbirchVerificationStateKeys.VERIFICATION_SUCCESSFUL);
          expect(result.anchors).toBeDefined();
          expect(result.anchors.length).toEqual(1);
          const anchor = result.anchors[0];
          expect(anchor).toBeDefined();
          expect(anchor.iconUrl).toBeDefined();
          expect(anchor.iconUrl).toEqual("Ethereum-Classic_verify_right.png");
          expect(anchor.blxTxExplorerUrl).toBeDefined();
          expect(anchor.blxTxExplorerUrl).toContain("https://kottiexplorer.ethernode.io/search?q=");
          done();
        });

    });

    test('should handle IOTA bockchain anchor with version 1.0.0 (second anchor in example)', (done) => {
      const response = deepCopy(verifyResult);
      // use IOTA anchor with version 1.0.0
      response.anchors.upper_blockchains = [ deepCopy(blxProps).upper_blockchains[1] ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          json: () => response,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => keyServiceResult,
        });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((result: IUbirchVerificationResult) => {
          expect(result).toBeDefined();
          expect(result.verificationState).toBe(EUbirchVerificationStateKeys.VERIFICATION_SUCCESSFUL);
          expect(result.anchors).toBeDefined();
          expect(result.anchors.length).toEqual(1);
          const anchor = result.anchors[0];
          expect(anchor).toBeDefined();
          expect(anchor.iconUrl).toBeDefined();
          expect(anchor.iconUrl).toEqual("IOTA_verify_right.png");
          expect(anchor.blxTxExplorerUrl).toBeDefined();
          expect(anchor.blxTxExplorerUrl).toContain("https://explorer.iota.org/legacy-mainnet/transaction/");
          done();
        });

    });

    test('should handle IOTA bockchain anchor with version 1.5.0 (third anchor in example)', (done) => {
      const response = deepCopy(verifyResult);
      // use IOTA anchor with version 1.5.0
      response.anchors.upper_blockchains = [ deepCopy(blxProps).upper_blockchains[2] ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          json: () => response,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => keyServiceResult,
        });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((result: IUbirchVerificationResult) => {
          expect(result).toBeDefined();
          expect(result.verificationState).toBe(EUbirchVerificationStateKeys.VERIFICATION_SUCCESSFUL);
          expect(result.anchors).toBeDefined();
          expect(result.anchors.length).toEqual(1);
          const anchor = result.anchors[0];
          expect(anchor).toBeDefined();
          expect(anchor.iconUrl).toBeDefined();
          expect(anchor.iconUrl).toEqual("IOTA_verify_right.png");
          expect(anchor.blxTxExplorerUrl).toBeDefined();
          expect(anchor.blxTxExplorerUrl).toContain("https://explorer.iota.org/mainnet/message/");
          done();
        });

    });

    test('should fail on handling bockchain anchor with not existing versions', (done) => {
      const response = deepCopy(verifyResult);
      // use IOTA anchor with not defined version in blockchain-settings
      response.anchors.upper_blockchains = [ deepCopy(blxProps).upper_blockchains[2] ];
      response.anchors.upper_blockchains[0].properties.version = "undefined";

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          json: () => response,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => keyServiceResult,
        });

      const infoReceived = [];
      const infoChain = [
        EUbirchVerificationStateKeys.VERIFICATION_PENDING,
        EInfo.START_VERIFICATION_CALL,
        EInfo.START_CHECKING_RESPONSE,
        EInfo.UPP_HAS_BEEN_FOUND,
        EInfo.SIGNATURE_VERIFICATION_SUCCESSFULLY,
        EInfo.BLOCKCHAIN_SETTINGS_INCOMPLETE,
        EInfo.BLOCKCHAIN_SETTINGS_INCOMPLETE,
        EInfo.NO_BLXTX_FOUND,
        EUbirchVerificationStateKeys.VERIFICATION_PARTLY_SUCCESSFUL,
      ];

      const subscription = verifier.messenger.subscribe((message: UbirchMessage) => {
        if (message !== null) {
          infoReceived.push(message.code);
        }
      });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((result: IUbirchVerificationResult) => {
          expect(result).toBeDefined();
          expect(result.verificationState).toBe(EUbirchVerificationStateKeys.VERIFICATION_PARTLY_SUCCESSFUL);
          expect(infoReceived).toEqual(infoChain);
          expect(result.anchors).toBeDefined();
          expect(result.anchors.length).toEqual(0);
          subscription.unsubscribe();
          done();
        });

    });

    test('should handle missing version settings but version property set for that anchor', (done) => {
      const response = deepCopy(verifyResult);
      // use etherium-classic anchor and add version
      response.anchors.upper_blockchains = [ deepCopy(blxProps).upper_blockchains[0] ];
      response.anchors.upper_blockchains[0].properties.version = "1.0.0";

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          json: () => response,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => keyServiceResult,
        });

      const infoReceived = [];
      const infoChain = [
        EUbirchVerificationStateKeys.VERIFICATION_PENDING,
        EInfo.START_VERIFICATION_CALL,
        EInfo.START_CHECKING_RESPONSE,
        EInfo.UPP_HAS_BEEN_FOUND,
        EInfo.SIGNATURE_VERIFICATION_SUCCESSFULLY,
        EInfo.BLOCKCHAIN_SETTINGS_INCOMPLETE,
        EInfo.BLOCKCHAIN_SETTINGS_INCOMPLETE,
        EInfo.NO_BLXTX_FOUND,
        EUbirchVerificationStateKeys.VERIFICATION_PARTLY_SUCCESSFUL,
      ];

      const subscription = verifier.messenger.subscribe((message: UbirchMessage) => {
        if (message !== null) {
          infoReceived.push(message.code);
        }
      });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((result: IUbirchVerificationResult) => {
          expect(result).toBeDefined();
          expect(result.verificationState).toBe(EUbirchVerificationStateKeys.VERIFICATION_PARTLY_SUCCESSFUL);
          expect(infoReceived).toEqual(infoChain);
          expect(result.anchors).toBeDefined();
          expect(result.anchors.length).toEqual(0);
          subscription.unsubscribe();
          done();
        });

    });

    test('should handle missing network tyoe on version settings', (done) => {
      const response = deepCopy(verifyResult);
      // use IOTA anchor with version 1.5.0 and remove mainnet settings for that version
      response.anchors.upper_blockchains = [ deepCopy(blxProps).upper_blockchains[2] ];
      response.anchors.upper_blockchains[0].properties.network_type = "undefined";

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          json: () => response,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => keyServiceResult,
        });

      const infoReceived = [];
      const infoChain = [
        EUbirchVerificationStateKeys.VERIFICATION_PENDING,
        EInfo.START_VERIFICATION_CALL,
        EInfo.START_CHECKING_RESPONSE,
        EInfo.UPP_HAS_BEEN_FOUND,
        EInfo.SIGNATURE_VERIFICATION_SUCCESSFULLY,
        EInfo.BLOCKCHAIN_SETTINGS_INCOMPLETE,
        EInfo.BLOCKCHAIN_SETTINGS_INCOMPLETE,
        EInfo.NO_BLXTX_FOUND,
        EUbirchVerificationStateKeys.VERIFICATION_PARTLY_SUCCESSFUL,
      ];

      const subscription = verifier.messenger.subscribe((message: UbirchMessage) => {
        if (message !== null) {
          infoReceived.push(message.code);
        }
      });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((result: IUbirchVerificationResult) => {
          expect(result).toBeDefined();
          expect(result.verificationState).toBe(EUbirchVerificationStateKeys.VERIFICATION_PARTLY_SUCCESSFUL);
          expect(infoReceived).toEqual(infoChain);
          expect(result.anchors).toBeDefined();
          expect(result.anchors.length).toEqual(0);
          subscription.unsubscribe();
          done();
        });

    });

    test('should warn with WARNING_EMPTY_BLXTX_FOUND if no blockchain or network type is specified', (done) => {
      const response = deepCopy(verifyResult);
      response.anchors.upper_blockchains.push(...deepCopy(response.anchors.upper_blockchains));

      response.anchors.upper_blockchains[0].properties.blockchain = '';
      response.anchors.upper_blockchains[1].properties.blockchain = undefined;
      response.anchors.upper_blockchains[2].properties = undefined;
      response.anchors.upper_blockchains[3].properties.network_type = '';
      response.anchors.upper_blockchains[4].properties.network_type = undefined;

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          json: () => response,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => keyServiceResult,
        });

      const infoReceived = [];
      const infoChain = [
        EUbirchVerificationStateKeys.VERIFICATION_PENDING,
        EInfo.START_VERIFICATION_CALL,
        EInfo.START_CHECKING_RESPONSE,
        EInfo.UPP_HAS_BEEN_FOUND,
        EInfo.SIGNATURE_VERIFICATION_SUCCESSFULLY,
        EInfo.WARNING_EMPTY_BLXTX_FOUND,
        EInfo.WARNING_EMPTY_BLXTX_FOUND,
        EInfo.WARNING_EMPTY_BLXTX_FOUND,
        EInfo.WARNING_EMPTY_BLXTX_FOUND,
        EInfo.WARNING_EMPTY_BLXTX_FOUND,
        EInfo.BLXTXS_FOUND_SUCCESS,
        EUbirchVerificationStateKeys.VERIFICATION_SUCCESSFUL,
      ];

      const subscription = verifier.messenger.subscribe((message: UbirchMessage) => {
        if (message !== null) {
          infoReceived.push(message.code);
        }
      });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((response: IUbirchVerificationResult) => {
          expect(response).toBeDefined();
          expect(response.verificationState).toBe(EUbirchVerificationStateKeys.VERIFICATION_SUCCESSFUL);
          expect(infoReceived).toEqual(infoChain);
          subscription.unsubscribe();
          done();
        });
    });

    test('should warn with NO_BLXTX_FOUND if any of the blockchain data is in settings', (done) => {
      const response = deepCopy(verifyResult);
      response.anchors.upper_blockchains[0].properties.blockchain = 'unknown';
      response.anchors.upper_blockchains[1].properties.network_type = 'unknown';
      response.anchors.upper_blockchains[2].properties.txid = undefined;

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          json: () => response,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => keyServiceResult,
        });

      const infoReceived = [];
      const infoChain = [
        EUbirchVerificationStateKeys.VERIFICATION_PENDING,
        EInfo.START_VERIFICATION_CALL,
        EInfo.START_CHECKING_RESPONSE,
        EInfo.UPP_HAS_BEEN_FOUND,
        EInfo.SIGNATURE_VERIFICATION_SUCCESSFULLY,
        EInfo.BLOCKCHAIN_SETTINGS_INCOMPLETE,
        EInfo.NO_BLXTX_FOUND,
        EUbirchVerificationStateKeys.VERIFICATION_PARTLY_SUCCESSFUL,
      ];

      const subscription = verifier.messenger.subscribe((message: UbirchMessage) => {
        if (message !== null) {
          infoReceived.push(message.code);
        }
      });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((response: IUbirchVerificationResult) => {
          expect(response).toBeDefined();
          expect(response.verificationState).toBe(
            EUbirchVerificationStateKeys.VERIFICATION_PARTLY_SUCCESSFUL
          );
          expect(infoReceived).toEqual(infoChain);
          subscription.unsubscribe();
          done();
        });
    });

    test('should warn with NO_BLXTX_FOUND if anchors are missing', (done) => {
      const response = deepCopy(verifyResult);
      response.anchors = undefined;

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          json: () => response,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => keyServiceResult,
        });

      const infoReceived = [];
      const infoChain = [
        EUbirchVerificationStateKeys.VERIFICATION_PENDING,
        EInfo.START_VERIFICATION_CALL,
        EInfo.START_CHECKING_RESPONSE,
        EInfo.UPP_HAS_BEEN_FOUND,
        EInfo.SIGNATURE_VERIFICATION_SUCCESSFULLY,
        EInfo.NO_BLXTX_FOUND,
        EUbirchVerificationStateKeys.VERIFICATION_PARTLY_SUCCESSFUL,
      ];

      const subscription = verifier.messenger.subscribe((message: UbirchMessage) => {
        if (message !== null) {
          infoReceived.push(message.code);
        }
      });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((response: IUbirchVerificationResult) => {
          expect(response).toBeDefined();
          expect(response.verificationState).toBe(
            EUbirchVerificationStateKeys.VERIFICATION_PARTLY_SUCCESSFUL
          );
          expect(infoReceived).toEqual(infoChain);
          subscription.unsubscribe();
          done();
        });
    });

    test('should fail with VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE if no upp is returned', () => {
      const responseJSON: string = '{"anchors":{"upper_blockchains":[]},"prev":"","upp":""}';

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          json: () => JSON.parse(responseJSON),
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => keyServiceResult,
        });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((response: IUbirchVerificationResult) => {
          expect(response).toBeDefined();
          expect(response.verificationState).toBe(EUbirchVerificationStateKeys.VERIFICATION_FAILED);
          expect(response.failReason).toBe(EError.VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE);
        });
    });

    test('should fail with UNKNOWN_ERROR', () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          json: 'malformed-api',
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => keyServiceResult,
        });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((response: IUbirchVerificationResult) => {
          expect(response).toBeDefined();
          expect(response.verificationState).toBe(EUbirchVerificationStateKeys.VERIFICATION_FAILED);
          expect(response.failReason).toBe(EError.UNKNOWN_ERROR);
        });
    });

    test('should send the hash successfully and return a VERIFICATION_SUCCESSFUL response', () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          json: () => verifyResult,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => keyServiceResult,
        });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((response: IUbirchVerificationResult) => {
          checkSuccessfulVerificationCall(response);
        });
    });

    test('should send the hash successfully and return a VERIFICATION_SUCCESSFUL response with verbose information', () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          json: () => verifyResult,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => keyServiceResult,
        });

      return verifier
        .verifyHash(testhash_verifiable, true)
        .then((response: IUbirchVerificationResult) => {
          checkSuccessfulVerificationCall(response);
          expect(response.lowerAnchors).toBeDefined();
          expect(response.lowerAnchors).toHaveLength(3);
          expect(response.rawData).toBeDefined();
          expect(response.rawData.upp).toBeDefined();
          expect(response.rawData.prev).toBeDefined();
          expect(response.rawData.anchors).toBeDefined();
          expect(response.rawData.anchors.upper_path).toBeDefined();
          expect(response.rawData.anchors.upper_path).toHaveLength(6);
          expect(response.rawData.anchors.upper_path[0].label).toBe(EUbirchVerificationTreeNodeType.UPP);
          expect(response.rawData.anchors.upper_path[1].label).toBe(EUbirchVerificationTreeNodeType.FOUNDATION_TREE);
          expect(response.rawData.anchors.upper_path[5].label).toBe(EUbirchVerificationTreeNodeType.MASTER_TREE);
          expect(response.rawData.anchors.lower_path).toBeDefined();
          expect(response.rawData.anchors.lower_path).toHaveLength(9);
          expect(response.rawData.anchors.lower_path[0].label).toBe(EUbirchVerificationTreeNodeType.MASTER_TREE);
          expect(response.rawData.anchors.lower_path[8].label).toBe(EUbirchVerificationTreeNodeType.MASTER_TREE);
          expect(response.rawData.anchors.upper_blockchains).toBeDefined();
          expect(response.rawData.anchors.upper_blockchains).toHaveLength(3);
          expect(response.rawData.anchors.upper_blockchains[0].label).toBe(EUbirchVerificationTreeNodeType.PUBLIC_CHAIN);
          expect(response.rawData.anchors.lower_blockchains).toBeDefined();
          expect(response.rawData.anchors.lower_blockchains).toHaveLength(3);
          expect(response.rawData.anchors.lower_blockchains[0].label).toBe(EUbirchVerificationTreeNodeType.PUBLIC_CHAIN);
        });
    });

    test('should return a VERIFICATION_SUCCESSFUL response with anchors with alternative data', () => {
      const response = deepCopy(verifyResult);
      response.anchors.upper_blockchains[0].properties.network_info = undefined;

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          json: () => response,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => keyServiceResult,
        });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((response: IUbirchVerificationResult) => {
          expect(response).toBeDefined();
          expect(response.upp).toBeDefined();
          expect(response.upp.state).toBe(EUppStates.anchored);
          expect(response.verificationState).toBe(EUbirchVerificationStateKeys.VERIFICATION_SUCCESSFUL);
          expect(response.anchors).toBeDefined();
          expect(response.anchors).toHaveLength(3);
          expect(response.firstAnchorTimestamp).toBe('2020-10-21T10:13:16.548Z');
          expect(response.creationTimestamp).toBe('2020-10-21T10:11:02.397Z');

          const firstAnchor: IUbirchBlockchainAnchor = response.anchors[0];
          expect(firstAnchor.blxTxExplorerUrl).toBeDefined();
          expect(firstAnchor.iconUrl).toBeDefined();
          expect(firstAnchor.label).toEqual('iota');
          expect(firstAnchor.networkInfo).not.toBeDefined();
          expect(firstAnchor.networkType).toBeDefined();
          expect(firstAnchor.timestamp).toBeDefined();
          expect(firstAnchor.txid).toBeDefined();

          expect(response.failReason).toBeUndefined();
        });
    });

    test('should return a VERIFICATION_SUCCESSFUL response with timestamp of first available anchor', () => {
      const response = deepCopy(verifyResult);
      response.anchors.upper_blockchains[2].properties.timestamp = '2000-09-21T10:13:16.548Z';

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          json: () => response,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => keyServiceResult,
        });

      return verifier
        .verifyHash(testhash_verifiable)
        .then((response: IUbirchVerificationResult) => {
          expect(response.firstAnchorTimestamp).toBe('2000-09-21T10:13:16.548Z');
        });
    });

    test('should send the hash to default production stage', () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          json: () => verifyResult,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => keyServiceResult,
        });

      const prodVerifier = new UbirchVerificationMock({ ...defaultSettings, stage: undefined });
      return prodVerifier
        .verifyHash(testhash_verifiable)
        .then((response: IUbirchVerificationResult) => {
          expect(global.fetch).toHaveBeenCalledWith(
            'https://verify.prod.ubirch.com/api/v2/upp/verify/record?response_form=anchors_with_path&blockchain_info=ext',
            {
              body: testhash_verifiable,
              headers: {
                'Content-type': 'text/plain',
                authorization: 'bearer ' + defaultSettings.accessToken,
              },
              method: 'POST',
            }
          );
        });
    });

    test('that watchInfosAndErrors observable is called', (done) => {
      const infoReceived = [];
      const infoChain = [
        EUbirchVerificationStateKeys.VERIFICATION_PENDING,
        EInfo.START_VERIFICATION_CALL,
        EInfo.START_CHECKING_RESPONSE,
        EInfo.UPP_HAS_BEEN_FOUND,
        EInfo.SIGNATURE_VERIFICATION_SUCCESSFULLY,
        EInfo.BLXTXS_FOUND_SUCCESS,
        EUbirchVerificationStateKeys.VERIFICATION_SUCCESSFUL,
      ];

      const subscription = verifier.messenger.subscribe((message: UbirchMessage) => {
        if (message !== null) {
          infoReceived.push(message.code);
        }
      });

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          json: () => verifyResult,
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => keyServiceResult,
        });

      verifier.verifyHash(testhash_verifiable).then((_) => {
        expect(infoReceived).toEqual(infoChain);
        subscription.unsubscribe();
        done();
      });
    });
  });

  test('pubKey request rejected', (done) => {
    const infoReceived = [];
    const infoChain = [
      EUbirchVerificationStateKeys.VERIFICATION_PENDING,
      EInfo.START_VERIFICATION_CALL,
      EInfo.START_CHECKING_RESPONSE,
      EInfo.UPP_HAS_BEEN_FOUND,
      EError.VERIFICATION_FAILED_SIGNATURE_CANNOT_BE_VERIFIED,
      EError.VERIFICATION_FAILED_SIGNATURE_CANNOT_BE_VERIFIED,
      EUbirchVerificationStateKeys.VERIFICATION_FAILED,
    ];

    const subscription = verifier.messenger.subscribe((message: UbirchMessage) => {
      if (message !== null) {
        infoReceived.push(message.code);
      }
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        status: 200,
        json: () => verifyResult,
      })
      .mockRejectedValueOnce(new Error('connection-error'));

    verifier.verifyHash(testhash_verifiable).then((_) => {
      expect(infoReceived).toEqual(infoChain);
      subscription.unsubscribe();
      done();
    });
  });

  test('molformed pubKey response recieved', (done) => {
    const infoReceived = [];
    const infoChain = [
      EUbirchVerificationStateKeys.VERIFICATION_PENDING,
      EInfo.START_VERIFICATION_CALL,
      EInfo.START_CHECKING_RESPONSE,
      EInfo.UPP_HAS_BEEN_FOUND,
      EError.VERIFICATION_FAILED_SIGNATURE_CANNOT_BE_VERIFIED,
      EUbirchVerificationStateKeys.VERIFICATION_FAILED,
    ];

    const subscription = verifier.messenger.subscribe((message: UbirchMessage) => {
      if (message !== null) {
        infoReceived.push(message.code);
      }
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        status: 200,
        json: () => verifyResult,
      })
      .mockResolvedValueOnce({
        status: 200,
        json: () => 'malformed-response',
      });

    verifier.verifyHash(testhash_verifiable).then((_) => {
      expect(infoReceived).toEqual(infoChain);
      subscription.unsubscribe();
      done();
    });
  });

  test('pubKey response recieved with not success code', (done) => {
    const infoReceived = [];
    const infoChain = [
      EUbirchVerificationStateKeys.VERIFICATION_PENDING,
      EInfo.START_VERIFICATION_CALL,
      EInfo.START_CHECKING_RESPONSE,
      EInfo.UPP_HAS_BEEN_FOUND,
      EError.VERIFICATION_FAILED_SIGNATURE_CANNOT_BE_VERIFIED,
      EError.VERIFICATION_FAILED_SIGNATURE_CANNOT_BE_VERIFIED,
      EUbirchVerificationStateKeys.VERIFICATION_FAILED,
    ];

    const subscription = verifier.messenger.subscribe((message: UbirchMessage) => {
      if (message !== null) {
        infoReceived.push(message.code);
      }
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        status: 200,
        json: () => verifyResult,
      })
      .mockResolvedValueOnce({
        status: 999,
        json: () => keyServiceResult,
      });

    verifier.verifyHash(testhash_verifiable).then((_) => {
      expect(infoReceived).toEqual(infoChain);
      subscription.unsubscribe();
      done();
    });
  });

  test('undefined pubKey recieved', (done) => {
    const infoReceived = [];
    const infoChain = [
      EUbirchVerificationStateKeys.VERIFICATION_PENDING,
      EInfo.START_VERIFICATION_CALL,
      EInfo.START_CHECKING_RESPONSE,
      EInfo.UPP_HAS_BEEN_FOUND,
      EError.VERIFICATION_FAILED_SIGNATURE_CANNOT_BE_VERIFIED,
      EError.VERIFICATION_FAILED_SIGNATURE_CANNOT_BE_VERIFIED,
      EUbirchVerificationStateKeys.VERIFICATION_FAILED,
    ];

    const subscription = verifier.messenger.subscribe((message: UbirchMessage) => {
      if (message !== null) {
        infoReceived.push(message.code);
      }
    });

    const keyServiceResultMalformed = deepCopy(keyServiceResult);
    keyServiceResultMalformed[0].pubKeyInfo.pubKey = undefined;

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        status: 200,
        json: () => verifyResult,
      })
      .mockResolvedValueOnce({
        status: 200,
        json: () => keyServiceResultMalformed,
      });

    verifier.verifyHash(testhash_verifiable).then((_) => {
      expect(infoReceived).toEqual(infoChain);
      subscription.unsubscribe();
      done();
    });
  });

  test('unverified pubKey received', (done) => {
    const infoReceived = [];
    const infoChain = [
      EUbirchVerificationStateKeys.VERIFICATION_PENDING,
      EInfo.START_VERIFICATION_CALL,
      EInfo.START_CHECKING_RESPONSE,
      EInfo.UPP_HAS_BEEN_FOUND,
      EError.VERIFICATION_FAILED_SIGNATURE_CANNOT_BE_VERIFIED,
      EError.VERIFICATION_FAILED_SIGNATURE_CANNOT_BE_VERIFIED,
      EUbirchVerificationStateKeys.VERIFICATION_FAILED,
    ];

    const subscription = verifier.messenger.subscribe((message: UbirchMessage) => {
      if (message !== null) {
        infoReceived.push(message.code);
      }
    });

    (UbirchProtocol.verify as jest.Mock).mockReturnValueOnce(false);

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        status: 200,
        json: () => verifyResult,
      })
      .mockResolvedValueOnce({
        status: 200,
        json: () => keyServiceResult,
      });

    verifier.verifyHash(testhash_verifiable).then((_) => {
      expect(infoReceived).toEqual(infoChain);
      subscription.unsubscribe();
      done();
    });
  });
});

describe('Prod Verification', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear().mockReset();
    testhash_from_complicated_device = 'kmoC3n84AA4Oqyhe8If5gCoQQ8fG+9JRMUST2vH8jSI=';
    prodVerifier = new UbirchVerificationMock(prodSettings);
    prodVerifier.log(null);
  });
  xtest('hash anchored by device with complicated UUID (cc738b46-f61b-50f7-21a1-c2256920b1c1) format shall be verifiable', (done) => {
    const infoReceived = [];
    const infoChain = [
      EUbirchVerificationStateKeys.VERIFICATION_PENDING,
      EInfo.START_VERIFICATION_CALL,
      EInfo.START_CHECKING_RESPONSE,
      EInfo.UPP_HAS_BEEN_FOUND,
      EError.VERIFICATION_FAILED_CANNOT_DECODE_HWDEVICEID_FROM_UPP,
      EUbirchVerificationStateKeys.VERIFICATION_FAILED,
    ];

    const subscription = prodVerifier.messenger.subscribe((message: UbirchMessage) => {
      if (message !== null) {
        infoReceived.push(message.code);
      }
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        status: 200,
        json: () => verifyResult,
      })
      .mockResolvedValueOnce({
        status: 200,
        json: () => keyServiceResult,
      });

    prodVerifier.verifyHash(testhash_from_complicated_device).then((_) => {
      expect(infoReceived).toEqual(infoChain);
      subscription.unsubscribe();
      done();
    });
  });
});
