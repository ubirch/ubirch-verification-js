"use strict";

export class UbirchVerification {
  constructor() {
    return this;
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
