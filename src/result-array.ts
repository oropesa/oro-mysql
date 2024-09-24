import { Ofn } from 'oro-functions-client';

type ResultArrayErrorType =
  | 'server-down'
  | 'wrong-format'
  | 'wrong-fnsanitize'
  | 'wrong-fnvaluesanitize'
  | 'wrong-query';

export interface ResultArrayError extends Record<string, any> {
  type: ResultArrayErrorType;
  msg: string;
}

export interface ResultArrayColumn {
  characterSet: number;
  encoding: 'binary' | 'utf8';
  name: string;
  columnLength: number;
  columnType: number;
  flags: number;
  decimals: number;
}

export class ResultArray extends Array {
  public status: boolean | null;
  public count: number | null;
  public statement: string | null;
  public columns: ResultArrayColumn[];
  public error?: ResultArrayError;

  public constructor() {
    super();
    this.status = null;
    this.count = null;
    this.statement = null;
    this.columns = [];
  }

  public clone() {
    const result = new ResultArray();

    this.map((value, key) => {
      result[key] = Ofn.cloneObject(value);
    });

    result.status = this.status;
    result.count = this.count;
    result.statement = this.statement;
    result.columns = Ofn.cloneArray(this.columns);

    if (this.error) {
      result.error = Ofn.cloneObject(this.error);
    }

    return result;
  }
}
