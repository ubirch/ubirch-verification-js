"use strict";

import { EHashAlgorithms } from './models';
import { sha256 } from 'js-sha256';
import { sha512 } from 'js-sha512';

export class UbirchVerification {
  constructor() {
    return this;
  }

  public createHash(json: string, hashAlgorithm: EHashAlgorithms = EHashAlgorithms.SHA256): string {
    let transIdAB: ArrayBuffer;

    switch (hashAlgorithm) {
      case EHashAlgorithms.SHA256: {
        transIdAB = sha256.arrayBuffer(json);
        break;
      }
      case EHashAlgorithms.SHA512: {
        transIdAB = sha512.arrayBuffer(json);
        break;
      }
    }
    const transId: string = btoa(new Uint8Array(transIdAB).reduce((data, byte) => data + String.fromCharCode(byte), ''));

    return transId;
  }

  public formatJSON(json: string, sort: boolean = true): string {
    const object: object = JSON.parse(json);
    const trimmedObject: object = this.sortObjectRecursive(object, sort);

    return JSON.stringify(trimmedObject);
  }

  private sortObjectRecursive(object: any, sort: boolean): object {
    // recursive termination condition
    if (typeof (object) !== 'object' || Array.isArray(object)) {
      return object;
    } else {
      const objectSorted: { [ key: string ]: any } = {};
      const keysOrdered: { [ key: string ]: any } = sort ? Object.keys(object).sort() : Object.keys(object);

      keysOrdered.forEach((key: string) => objectSorted[ key ] = this.sortObjectRecursive(object[ key ], sort),
      );

      return objectSorted;
    }
  }
}

module.exports = { UbirchVerification };
