import type { ConnectionOptions } from 'mysql2';
import mysql from 'mysql2/promise';
import type { Connection } from 'mysql2/promise';
import { Ofn } from 'oro-functions-client';
import type { SResponseOKObject, SResponseOKSimple } from 'oro-functions-client';

import type {
  OMysqlConfig,
  OMysqlPoolCloseInput,
  OMysqlPoolOpenInput,
  OMysqlQueryArrayByIdFnOpts,
  OMysqlQueryArrayByIdFnOutput,
  OMysqlQueryArrayByIdOpts,
  OMysqlQueryArrayByIdOutput,
  OMysqlQueryArrayFnOpts,
  OMysqlQueryArrayFnOutput,
  OMysqlQueryArrayOpts,
  OMysqlQueryArrayOutput,
  OMysqlQueryBoolFnOpts,
  OMysqlQueryBoolFnOutput,
  OMysqlQueryBoolOpts,
  OMysqlQueryBoolOutput,
  OMysqlQueryCountFnOpts,
  OMysqlQueryCountFnOutput,
  OMysqlQueryCountOpts,
  OMysqlQueryCountOutput,
  OMysqlQueryDefaultOpts,
  OMysqlQueryDefaultOutput,
  OMysqlQueryFormat,
  OMysqlQueryIdFnOpts,
  OMysqlQueryIdFnOutput,
  OMysqlQueryIdOpts,
  OMysqlQueryIdOutput,
  OMysqlQueryOnceResponse,
  OMysqlQueryOpts,
  OMysqlQueryRowFnOpts,
  OMysqlQueryRowFnOutput,
  OMysqlQueryRowOpts,
  OMysqlQueryRowOutput,
  OMysqlQueryRowStrictFnOpts,
  OMysqlQueryRowStrictFnOutput,
  OMysqlQueryRowStrictOpts,
  OMysqlQueryRowStrictOutput,
  OMysqlQueryValueFnOpts,
  OMysqlQueryValueFnOutput,
  OMysqlQueryValueOpts,
  OMysqlQueryValueOutput,
  OMysqlQueryValuesByIdFnOpts,
  OMysqlQueryValuesByIdFnOutput,
  OMysqlQueryValuesByIdOpts,
  OMysqlQueryValuesByIdOutput,
  OMysqlQueryValuesFnOpts,
  OMysqlQueryValuesFnOutput,
  OMysqlQueryValuesOpts,
  OMysqlQueryValuesOutput,
  OMysqlServerStatus,
  OMysqlServerStatusError,
} from './oro-mysql-types';
import { ResultArray } from './result-array';
import type { ResultArrayColumn } from './result-array';

export const ALLOWED_QUERY_FORMATS: readonly OMysqlQueryFormat[] = [
  'id',
  'bool',
  'count',
  'value',
  'values',
  'valuesById',
  'array',
  'arrayById',
  'rowStrict',
  'row',
  'default',
];

const DB_COLUMNS: Array<keyof ResultArrayColumn> = [
  'characterSet',
  'encoding',
  'name',
  'columnLength',
  'columnType',
  'flags',
  'decimals',
];

interface QueryReturnInput {
  result: ResultArray;
  fnSanitize?: (...args: any[]) => any;
}

interface QueryReturnKeyInput {
  result: ResultArray;
  valueKey?: string | number;
  fnSanitize?: (...args: any[]) => any;
}

interface QueryReturnKeyIdInput {
  result: ResultArray;
  valueKey?: string | number;
  valueId?: string | number;
  fnSanitize?: (...args: any[]) => any;
}

interface QueryReturnFnOpts {
  result: ResultArray;
  fnSanitize?: (...args: any[]) => any;
  fnValueSanitize?: (...args: any[]) => any;
}

interface QueryReturnKeyFnOpts {
  result: ResultArray;
  valueKey?: string | number;
  fnSanitize?: (...args: any[]) => any;
  fnValueSanitize?: (...args: any[]) => any;
}

const DEFAULT_CONFIG = {
  host: 'localhost',
  database: undefined,
  user: 'root',
  password: '',
} as const;

export class OMysql {
  public static sanitize(value: any): string {
    switch (true) {
      case Ofn.isNully(value):
        return 'NULL';
      case Ofn.isBoolean(value):
        return String(Number(value));
      case Ofn.isObject(value):
      case Ofn.isArray(value):
        return mysql.escape(JSON.stringify(value));
      default:
        return mysql.escape(value);
    }
  }

  public static getClient() {
    return mysql;
  }

  #db?: Connection;
  readonly #config: ConnectionOptions;
  #serverStatus: OMysqlServerStatus;

  #queryHistory: ResultArray[];
  #lastResult?: ResultArray;

  public constructor(config: OMysqlConfig = {}) {
    const opts = Ofn.isObject(config) ? Ofn.cloneObject(config) : {};

    this.#config = {
      ...DEFAULT_CONFIG,
      ...opts,
    };

    this.#queryHistory = [];
    this.#serverStatus = Ofn.setResponseKO('Not connected yet.');
  }

  public async poolOpen(args: OMysqlPoolOpenInput = {}): Promise<OMysqlServerStatus> {
    if (this.#db) {
      await this.poolClose(args);
    }

    if (args.oTimer) {
      args.oTimer.step(args.oTimerOpen || 'mysqlPoolOpen');
    }

    const response = await mysql
      .createConnection(this.#config)
      .then((db) => ({ status: true, db }) satisfies SResponseOKObject<{ db: Connection }>)
      .catch((error) => {
        const errorArray = error.toString().split('\r\n');
        const errorResponse = Ofn.setResponseKO<OMysqlServerStatusError>({
          msg: errorArray[0].replace(/\n/g, ' '),
        });

        if (args.oTimer) {
          errorResponse.error.times = args.oTimer.getTimes();
        }

        return errorResponse;
      });

    this.#db = response.status ? response.db : undefined;
    this.#serverStatus = response.status ? Ofn.setResponseOK('Connected successfully.') : response;

    return this.#serverStatus;
  }

  public async poolClose(args: OMysqlPoolCloseInput = {}): Promise<SResponseOKSimple> {
    if (args.oTimer) {
      args.oTimer.step(args.oTimerClose || 'mysqlPoolClose');
    }

    if (!this.#db) {
      return Ofn.setResponseOK('It is already disconnected.');
    }

    await this.#db.end();
    this.#db = undefined;
    this.#serverStatus = Ofn.setResponseKO('Disconnected successfully.');
    return Ofn.setResponseOK('Disconnected successfully.');
  }

  public getClient() {
    return mysql;
  }

  public getDB(): mysql.Connection | undefined {
    return this.#db;
  }

  public getInfo(): OMysqlConfig {
    const cloneConfig = Ofn.cloneObject(this.#config);
    if (cloneConfig.password) {
      cloneConfig.password = Array.from({ length: cloneConfig.password.length }).fill('*').join('');
    }

    return cloneConfig;
  }

  public getStatus(): OMysqlServerStatus {
    return Ofn.cloneObject(this.#serverStatus);
  }

  public get status(): boolean {
    return this.#serverStatus.status;
  }

  public getLastQuery(offset = 0, raw = false): ResultArray {
    return (
      this.#queryHistory[this.#queryHistory.length - offset - 1] &&
      (raw
        ? this.#queryHistory[this.#queryHistory.length - offset - 1]
        : this.#queryHistory[this.#queryHistory.length - offset - 1].clone())
    );
  }

  public getFirstQuery(offset = 0, raw = false): ResultArray {
    return this.#queryHistory[offset] && (raw ? this.#queryHistory[offset] : this.#queryHistory[offset].clone());
  }

  public getAllQueries(raw = false): ResultArray[] {
    return raw ? this.#queryHistory : this.#queryHistory.map((r) => r.clone());
  }

  public clearQueries(): number {
    const length = this.#queryHistory.length;
    this.#queryHistory = [];
    return length;
  }

  public getAffectedRows(): number {
    return this.#lastResult?.count ?? 0;
  }

  public sanitize(value: any): string {
    return OMysql.sanitize(value);
  }

  public async pqueryOnce(
    query: string,
    format?: 'default',
    valueKey?: undefined,
    valueId?: undefined,
    fnSanitize?: undefined,
  ): Promise<OMysqlQueryOnceResponse<ResultArray>>;
  public async pqueryOnce(
    query: string,
    format: 'bool',
    valueKey?: undefined,
    valueId?: undefined,
    fnSanitize?: undefined,
  ): Promise<OMysqlQueryOnceResponse<boolean>>;
  public async pqueryOnce<T>(
    query: string,
    format: 'bool',
    valueKey: undefined,
    valueId: undefined,
    fnSanitize: (result: boolean) => T,
  ): Promise<OMysqlQueryOnceResponse<T | false>>;
  public async pqueryOnce(
    query: string,
    format: 'count' | 'id',
    valueKey?: undefined,
    valueId?: undefined,
    fnSanitize?: undefined,
  ): Promise<OMysqlQueryOnceResponse<number | false>>;
  public async pqueryOnce<T>(
    query: string,
    format: 'count' | 'id',
    valueKey: undefined,
    valueId: undefined,
    fnSanitize: (result: number) => T,
  ): Promise<OMysqlQueryOnceResponse<T | false>>;
  public async pqueryOnce<T>(
    query: string,
    format: 'value',
    valueKey?: string | number,
    valueId?: undefined,
    fnSanitize?: undefined,
  ): Promise<OMysqlQueryOnceResponse<T | undefined | false>>;
  public async pqueryOnce<T>(
    query: string,
    format: 'value',
    valueKey: string | number | undefined,
    valueId: undefined,
    fnSanitize: (value: any) => T,
  ): Promise<OMysqlQueryOnceResponse<T | false>>;
  public async pqueryOnce<T>(
    query: string,
    format: 'values',
    valueKey?: string | number,
    valueId?: undefined,
    fnSanitize?: undefined,
  ): Promise<OMysqlQueryOnceResponse<Array<T | undefined> | false>>;
  public async pqueryOnce<T>(
    query: string,
    format: 'values',
    valueKey: string | number | undefined,
    valueId: undefined,
    fnSanitize: (value: any) => T,
  ): Promise<OMysqlQueryOnceResponse<Array<T> | false>>;
  public async pqueryOnce<T>(
    query: string,
    format: 'valuesById',
    valueKey?: string | number,
    valueId?: string | number,
    fnSanitize?: undefined,
  ): Promise<OMysqlQueryOnceResponse<Record<string, T | undefined> | false>>;
  public async pqueryOnce<T>(
    query: string,
    format: 'valuesById',
    valueKey: string | number | undefined,
    valueId: string | number | undefined,
    fnSanitize: (value: any) => T,
  ): Promise<OMysqlQueryOnceResponse<Record<string, T> | false>>;
  public async pqueryOnce<T>(
    query: string,
    format: 'array',
    valueKey?: undefined,
    valueId?: undefined,
    fnSanitize?: undefined,
  ): Promise<OMysqlQueryOnceResponse<T[] | false>>;
  public async pqueryOnce<T>(
    query: string,
    format: 'array',
    valueKey: undefined,
    valueId: undefined,
    fnSanitize: (value: any, key: string) => any,
  ): Promise<OMysqlQueryOnceResponse<T[] | false>>;
  public async pqueryOnce<T>(
    query: string,
    format: 'arrayById',
    valueKey?: string | number,
    valueId?: undefined,
    fnSanitize?: undefined,
  ): Promise<OMysqlQueryOnceResponse<Record<string, T> | false>>;
  public async pqueryOnce<T>(
    query: string,
    format: 'arrayById',
    valueKey: string | number | undefined,
    valueId: undefined,
    fnSanitize: (value: any, key: string) => any,
  ): Promise<OMysqlQueryOnceResponse<Record<string, T> | false>>;
  public async pqueryOnce<T>(
    query: string,
    format: 'row',
    valueKey?: number,
    valueId?: undefined,
    fnSanitize?: undefined,
  ): Promise<OMysqlQueryOnceResponse<T | undefined | false>>;
  public async pqueryOnce<T>(
    query: string,
    format: 'rowStrict',
    valueKey?: number,
    valueId?: undefined,
    fnSanitize?: undefined,
  ): Promise<OMysqlQueryOnceResponse<T | false>>;
  public async pqueryOnce<T>(
    query: string,
    format: 'row' | 'rowStrict',
    valueKey: number | undefined,
    valueId: undefined,
    fnSanitize: (value: any, key: string) => any,
  ): Promise<OMysqlQueryOnceResponse<T | false>>;
  // @deprecated
  public async pqueryOnce<T>(
    query: string,
    format: OMysqlQueryFormat = 'default',
    valueKey: string | number = 0,
    valueId: string | number = 0,
    fnSanitize?: (...args: any[]) => any,
  ): Promise<OMysqlQueryOnceResponse<any>> {
    const poolOpen = await this.poolOpen();
    if (!poolOpen.status) {
      return poolOpen;
    }

    // @ts-expect-error: let the overload-propagation to "pquery" function
    const result = await this.pquery<T>(query, format, valueKey, valueId, fnSanitize);

    await this.poolClose();

    const lastQuery = this.getLastQuery();
    if (!lastQuery.status) {
      return Ofn.setResponseKO(lastQuery.error!);
    }

    return Ofn.setResponseOK({ result });
  }

  public async pquery(
    query: string,
    format?: 'default',
    valueKey?: undefined,
    valueId?: undefined,
    fnSanitize?: undefined,
  ): Promise<ResultArray>;
  public async pquery(
    query: string,
    format: 'bool',
    valueKey?: undefined,
    valueId?: undefined,
    fnSanitize?: undefined,
  ): Promise<boolean>;
  public async pquery<T>(
    query: string,
    format: 'bool',
    valueKey: undefined,
    valueId: undefined,
    fnSanitize: (result: boolean) => T,
  ): Promise<T | false>;
  public async pquery(
    query: string,
    format: 'count' | 'id',
    valueKey?: undefined,
    valueId?: undefined,
    fnSanitize?: undefined,
  ): Promise<number | false>;
  public async pquery<T>(
    query: string,
    format: 'count' | 'id',
    valueKey: undefined,
    valueId: undefined,
    fnSanitize: (result: number) => T,
  ): Promise<T | false>;
  public async pquery<T>(
    query: string,
    format: 'value',
    valueKey?: string | number,
    valueId?: undefined,
    fnSanitize?: undefined,
  ): Promise<T | undefined | false>;
  public async pquery<T>(
    query: string,
    format: 'value',
    valueKey: string | number | undefined,
    valueId: undefined,
    fnSanitize: (value: any) => T,
  ): Promise<T | false>;
  public async pquery<T>(
    query: string,
    format: 'values',
    valueKey?: string | number,
    valueId?: undefined,
    fnSanitize?: undefined,
  ): Promise<Array<T | undefined> | false>;
  public async pquery<T>(
    query: string,
    format: 'values',
    valueKey: string | number | undefined,
    valueId: undefined,
    fnSanitize: (value: any) => T,
  ): Promise<Array<T> | false>;
  public async pquery<T>(
    query: string,
    format: 'valuesById',
    valueKey?: string | number,
    valueId?: string | number,
    fnSanitize?: undefined,
  ): Promise<Record<string, T | undefined> | false>;
  public async pquery<T>(
    query: string,
    format: 'valuesById',
    valueKey: string | number | undefined,
    valueId: string | number | undefined,
    fnSanitize: (value: any) => T,
  ): Promise<Record<string, T> | false>;
  public async pquery<T>(
    query: string,
    format: 'array',
    valueKey?: undefined,
    valueId?: undefined,
    fnSanitize?: undefined,
  ): Promise<T[] | false>;
  public async pquery<T>(
    query: string,
    format: 'array',
    valueKey: undefined,
    valueId: undefined,
    fnSanitize: (value: any, key: string) => any,
  ): Promise<T[] | false>;
  public async pquery<T>(
    query: string,
    format: 'arrayById',
    valueKey?: string | number,
    valueId?: undefined,
    fnSanitize?: undefined,
  ): Promise<Record<string, T> | false>;
  public async pquery<T>(
    query: string,
    format: 'arrayById',
    valueKey: string | number | undefined,
    valueId: undefined,
    fnSanitize: (value: any, key: string) => any,
  ): Promise<Record<string, T> | false>;
  public async pquery<T>(
    query: string,
    format: 'row',
    valueKey?: number,
    valueId?: undefined,
    fnSanitize?: undefined,
  ): Promise<T | undefined | false>;
  public async pquery<T>(
    query: string,
    format: 'rowStrict',
    valueKey?: number,
    valueId?: undefined,
    fnSanitize?: undefined,
  ): Promise<T | false>;
  public async pquery<T>(
    query: string,
    format: 'row' | 'rowStrict',
    valueKey: number | undefined,
    valueId: undefined,
    fnSanitize: (value: any, key: string) => any,
  ): Promise<T | false>;
  // @deprecated
  public async pquery<T>(
    query: string,
    format: OMysqlQueryFormat = 'default',
    valueKey: string | number = 0,
    valueId: string | number = 0,
    fnSanitize?: (...args: any[]) => any,
  ): Promise<any> {
    switch (format) {
      case 'bool':
        return fnSanitize
          ? await this.query(query, {
              format,
              fnSanitize: fnSanitize as OMysqlQueryBoolFnOpts<T>['fnSanitize'],
            })
          : await this.query(query, { format });
      case 'id':
        return fnSanitize
          ? await this.query(query, {
              format,
              fnSanitize: fnSanitize as OMysqlQueryIdFnOpts<T>['fnSanitize'],
            })
          : await this.query(query, { format });
      case 'count':
        return fnSanitize
          ? await this.query(query, {
              format,
              fnSanitize: fnSanitize as OMysqlQueryCountFnOpts<T>['fnSanitize'],
            })
          : await this.query(query, { format });
      case 'value':
        return fnSanitize
          ? await this.query<T>(query, {
              format,
              valueKey,
              fnSanitize: fnSanitize as OMysqlQueryValueFnOpts<T>['fnSanitize'],
            })
          : await this.query<T>(query, { format, valueKey });
      case 'values':
        return fnSanitize
          ? await this.query<T>(query, {
              format,
              valueKey,
              fnSanitize: fnSanitize as OMysqlQueryValuesFnOpts<T>['fnSanitize'],
            })
          : await this.query<T>(query, { format, valueKey });
      case 'valuesById':
        return fnSanitize
          ? await this.query<T>(query, {
              format,
              valueKey,
              valueId,
              fnSanitize: fnSanitize as OMysqlQueryValuesByIdFnOpts<T>['fnSanitize'],
            })
          : await this.query<T>(query, { format, valueKey, valueId });
      case 'array':
        return fnSanitize
          ? await this.query<T>(query, {
              format,
              fnValueSanitize: fnSanitize as OMysqlQueryArrayFnOpts<T>['fnValueSanitize'],
            })
          : await this.query<T>(query, { format });
      case 'arrayById':
        return fnSanitize
          ? await this.query<T>(query, {
              format,
              valueKey,
              fnValueSanitize: fnSanitize as OMysqlQueryArrayByIdFnOpts<T>['fnValueSanitize'],
            })
          : await this.query<T>(query, { format, valueKey });
      case 'row':
        return fnSanitize
          ? await this.query<T>(query, {
              format,
              valueKey: Number(valueKey),
              fnValueSanitize: fnSanitize as OMysqlQueryRowFnOpts<T>['fnValueSanitize'],
            })
          : await this.query<T>(query, { format, valueKey: Number(valueKey) });
      case 'rowStrict':
        return fnSanitize
          ? await this.query<T>(query, {
              format,
              valueKey: Number(valueKey),
              fnValueSanitize: fnSanitize as OMysqlQueryRowStrictFnOpts<T>['fnValueSanitize'],
            })
          : await this.query<T>(query, { format, valueKey: Number(valueKey) });
      // case 'default':
      default:
        return await this.query(query, { format });
    }
  }

  public async queryOnce(
    query: string,
    opts?: OMysqlQueryDefaultOpts,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryDefaultOutput>>;
  public async queryOnce(
    query: string,
    opts: OMysqlQueryBoolOpts,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryBoolOutput>>;
  public async queryOnce<T>(
    query: string,
    opts: OMysqlQueryBoolFnOpts<T>,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryBoolFnOutput<T>>>;
  public async queryOnce(
    query: string,
    opts: OMysqlQueryCountOpts,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryCountOutput>>;
  public async queryOnce<T>(
    query: string,
    opts: OMysqlQueryCountFnOpts<T>,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryCountFnOutput<T>>>;
  public async queryOnce(
    query: string,
    opts: OMysqlQueryIdOpts,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryIdOutput>>;
  public async queryOnce<T>(
    query: string,
    opts: OMysqlQueryIdFnOpts<T>,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryIdFnOutput<T>>>;
  public async queryOnce<T>(
    query: string,
    opts: OMysqlQueryValueOpts,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryValueOutput<T>>>;
  public async queryOnce<T>(
    query: string,
    opts: OMysqlQueryValueFnOpts<T>,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryValueFnOutput<T>>>;
  public async queryOnce<T>(
    query: string,
    opts: OMysqlQueryValuesOpts,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryValuesOutput<T>>>;
  public async queryOnce<T>(
    query: string,
    opts: OMysqlQueryValuesFnOpts<T>,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryValuesFnOutput<T>>>;
  public async queryOnce<T>(
    query: string,
    opts: OMysqlQueryValuesByIdOpts,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryValuesByIdOutput<T>>>;
  public async queryOnce<T>(
    query: string,
    opts: OMysqlQueryValuesByIdFnOpts<T>,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryValuesByIdFnOutput<T>>>;
  public async queryOnce<T>(
    query: string,
    opts: OMysqlQueryArrayOpts,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryArrayOutput<T>>>;
  public async queryOnce<T>(
    query: string,
    opts: OMysqlQueryArrayFnOpts<T>,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryArrayFnOutput<T>>>;
  public async queryOnce<T>(
    query: string,
    opts: OMysqlQueryArrayByIdOpts,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryArrayByIdOutput<T>>>;
  public async queryOnce<T>(
    query: string,
    opts: OMysqlQueryArrayByIdFnOpts<T>,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryArrayByIdFnOutput<T>>>;
  public async queryOnce<T>(
    query: string,
    opts: OMysqlQueryRowOpts,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryRowOutput<T>>>;
  public async queryOnce<T>(
    query: string,
    opts: OMysqlQueryRowFnOpts<T>,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryRowFnOutput<T>>>;
  public async queryOnce<T>(
    query: string,
    opts: OMysqlQueryRowStrictOpts,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryRowStrictOutput<T>>>;
  public async queryOnce<T>(
    query: string,
    opts: OMysqlQueryRowStrictFnOpts<T>,
  ): Promise<OMysqlQueryOnceResponse<OMysqlQueryRowStrictFnOutput<T>>>;
  public async queryOnce<T>(query: string, opts?: OMysqlQueryOpts): Promise<OMysqlQueryOnceResponse<any>> {
    const poolOpen = await this.poolOpen();
    if (!poolOpen.status) {
      return poolOpen;
    }

    // @ts-expect-error: let the overload-propagation to "query" function
    const result = await this.query<T>(query, opts);

    await this.poolClose();

    const lastQuery = this.getLastQuery();
    if (!lastQuery.status) {
      return Ofn.setResponseKO(lastQuery.error!);
    }

    return Ofn.setResponseOK({ result });
  }

  public async query(query: string, opts?: OMysqlQueryDefaultOpts): Promise<OMysqlQueryDefaultOutput>;
  public async query(query: string, opts: OMysqlQueryBoolOpts): Promise<OMysqlQueryBoolOutput>;
  public async query<T>(query: string, opts: OMysqlQueryBoolFnOpts<T>): Promise<OMysqlQueryBoolFnOutput<T>>;
  public async query(query: string, opts: OMysqlQueryCountOpts): Promise<OMysqlQueryCountOutput>;
  public async query<T>(query: string, opts: OMysqlQueryCountFnOpts<T>): Promise<OMysqlQueryCountFnOutput<T>>;
  public async query(query: string, opts: OMysqlQueryIdOpts): Promise<OMysqlQueryIdOutput>;
  public async query<T>(query: string, opts: OMysqlQueryIdFnOpts<T>): Promise<OMysqlQueryIdFnOutput<T>>;
  public async query<T>(query: string, opts: OMysqlQueryValueOpts): Promise<OMysqlQueryValueOutput<T>>;
  public async query<T>(query: string, opts: OMysqlQueryValueFnOpts<T>): Promise<OMysqlQueryValueFnOutput<T>>;
  public async query<T>(query: string, opts: OMysqlQueryValuesOpts): Promise<OMysqlQueryValuesOutput<T>>;
  public async query<T>(query: string, opts: OMysqlQueryValuesFnOpts<T>): Promise<OMysqlQueryValuesFnOutput<T>>;
  public async query<T>(query: string, opts: OMysqlQueryValuesByIdOpts): Promise<OMysqlQueryValuesByIdOutput<T>>;
  public async query<T>(
    query: string,
    opts: OMysqlQueryValuesByIdFnOpts<T>,
  ): Promise<OMysqlQueryValuesByIdFnOutput<T>>;
  public async query<T>(query: string, opts: OMysqlQueryArrayOpts): Promise<OMysqlQueryArrayOutput<T>>;
  public async query<T>(query: string, opts: OMysqlQueryArrayFnOpts<T>): Promise<OMysqlQueryArrayFnOutput<T>>;
  public async query<T>(query: string, opts: OMysqlQueryArrayByIdOpts): Promise<OMysqlQueryArrayByIdOutput<T>>;
  public async query<T>(query: string, opts: OMysqlQueryArrayByIdFnOpts<T>): Promise<OMysqlQueryArrayByIdFnOutput<T>>;
  public async query<T>(query: string, opts: OMysqlQueryRowOpts): Promise<OMysqlQueryRowOutput<T>>;
  public async query<T>(query: string, opts: OMysqlQueryRowFnOpts<T>): Promise<OMysqlQueryRowFnOutput<T>>;
  public async query<T>(query: string, opts: OMysqlQueryRowStrictOpts): Promise<OMysqlQueryRowStrictOutput<T>>;
  public async query<T>(query: string, opts: OMysqlQueryRowStrictFnOpts<T>): Promise<OMysqlQueryRowStrictFnOutput<T>>;
  public async query(query: string, opts?: OMysqlQueryOpts): Promise<any> {
    await this.#dbQuery(query);

    const { format, valueKey, valueId, fnSanitize, fnValueSanitize } = opts ?? {};
    const returnFormat = format ?? 'default';

    if (!this.#lastResult?.status) {
      return returnFormat === 'default' ? this.#lastResult : false;
    }

    if (!ALLOWED_QUERY_FORMATS.includes(returnFormat as OMysqlQueryFormat)) {
      this.#lastResult.status = false;
      this.#lastResult.error = {
        type: 'wrong-format',
        msg: `OMysql.query:format is not allowed: ${returnFormat}`,
        allowedFormats: ALLOWED_QUERY_FORMATS,
      };
      return false;
    }

    if (fnSanitize) {
      const fnSanitizeType = typeof fnSanitize;
      if (fnSanitizeType !== 'function') {
        this.#lastResult.status = false;
        this.#lastResult.error = {
          type: 'wrong-fnsanitize',
          msg: `OMysql.query:fnSanitize must be a function, not a ${fnSanitizeType}.`,
          fnSanitizeType,
        };
        return returnFormat === 'default' ? this.#lastResult : false;
      }
    }

    if (fnValueSanitize) {
      const fnValueSanitizeType = typeof fnValueSanitize;
      if (fnValueSanitizeType !== 'function') {
        this.#lastResult.status = false;
        this.#lastResult.error = {
          type: 'wrong-fnvaluesanitize',
          msg: `OMysql.query:fnValueSanitize must be a function, not a ${fnValueSanitizeType}.`,
          fnValueSanitizeType,
        };
        return returnFormat === 'default' ? this.#lastResult : false;
      }
    }

    switch (returnFormat) {
      case 'id':
        return this.#queryReturnId({ result: this.#lastResult, fnSanitize });
      case 'bool':
        return this.#queryReturnBool({ result: this.#lastResult, fnSanitize });
      case 'count':
        return this.#queryReturnCount({ result: this.#lastResult, fnSanitize });
      case 'value':
        return this.#queryReturnValue({ result: this.#lastResult, valueKey, fnSanitize });
      case 'values':
        return this.#queryReturnValues({ result: this.#lastResult, valueKey, fnSanitize });
      case 'valuesById':
        return this.#queryReturnValuesById({
          result: this.#lastResult,
          valueKey,
          valueId,
          fnSanitize,
        });
      case 'array':
        return this.#queryReturnArray({ result: this.#lastResult, fnSanitize, fnValueSanitize });
      case 'arrayById':
        return this.#queryReturnArrayById({
          result: this.#lastResult,
          valueKey,
          fnSanitize,
          fnValueSanitize,
        });
      case 'row':
        return this.#queryReturnRow({
          result: this.#lastResult,
          valueKey,
          fnSanitize,
          fnValueSanitize,
        });
      case 'rowStrict':
        return this.#queryReturnRowStrict({
          result: this.#lastResult,
          valueKey,
          fnSanitize,
          fnValueSanitize,
        });
      // case 'default':
      default:
        return this.#lastResult;
    }
  }

  #queryReturnId({ result, fnSanitize }: QueryReturnInput) {
    const insertId = Ofn.issetGet(result.columns[0], 'insertId');
    return fnSanitize ? fnSanitize(insertId) : insertId;
  }

  #queryReturnBool({ result, fnSanitize }: QueryReturnInput) {
    return fnSanitize ? fnSanitize(!!result.count) : !!result.count;
  }

  #queryReturnCount({ result, fnSanitize }: QueryReturnInput) {
    return fnSanitize ? fnSanitize(result.count) : result.count;
  }

  #queryReturnValue({ result, valueKey, fnSanitize }: QueryReturnKeyInput) {
    const labelKey = Ofn.isNully(valueKey) || !(Ofn.isString(valueKey) || Ofn.isNumeric(valueKey)) ? 0 : valueKey;
    const row = result[0] || {};
    const value = Ofn.isNumeric(labelKey) ? row[Object.keys(row)[Number(labelKey)]] : row[labelKey];
    return fnSanitize ? fnSanitize(value) : value;
  }

  #queryReturnValues({ result, valueKey, fnSanitize }: QueryReturnKeyInput) {
    const labelKey = Ofn.isNully(valueKey) || !(Ofn.isString(valueKey) || Ofn.isNumeric(valueKey)) ? 0 : valueKey;
    const arrayValues: any[] = [];
    for (const row of result) {
      const value = Ofn.isNumeric(labelKey) ? row[Object.keys(row)[Number(labelKey)]] : row[labelKey];
      arrayValues.push(fnSanitize ? fnSanitize(value) : value);
    }
    return arrayValues;
  }

  #queryReturnValuesById({ result, valueKey, valueId, fnSanitize }: QueryReturnKeyIdInput) {
    const labelKey = Ofn.isNully(valueKey) || !(Ofn.isString(valueKey) || Ofn.isNumeric(valueKey)) ? 0 : valueKey;
    let labelId = Ofn.isNully(valueId) || !(Ofn.isString(valueId) || Ofn.isNumeric(valueId)) ? 'id' : valueId;

    if (Ofn.isNumeric(labelId)) {
      labelId = Ofn.issetGet<string>(result.columns[Number(valueId)], 'name', 'id');
    }

    const objValues: Record<string, number> = {};
    for (const row of result) {
      if (row[labelId as string] === undefined) {
        continue;
      }

      const value = Ofn.isNumeric(labelKey) ? row[Object.keys(row)[Number(labelKey)]] : row[labelKey];
      objValues[row[labelId as string]] = fnSanitize ? fnSanitize(value) : value;
    }
    return objValues;
  }

  #queryReturnArray({ result, fnSanitize, fnValueSanitize }: QueryReturnFnOpts) {
    if (!fnSanitize && !fnValueSanitize) {
      return Ofn.cloneArray([...result]);
    }

    const array: Array<Record<string, any>> = [];
    for (const row of result) {
      const sanitizedRow: Record<string, any> = fnValueSanitize ? {} : row;
      if (fnValueSanitize) {
        const rowKeys = Object.keys(row);
        for (const key of rowKeys) {
          sanitizedRow[key] = fnValueSanitize(row[key], key);
        }
      }

      array.push(fnSanitize ? fnSanitize(sanitizedRow) : sanitizedRow);
    }
    return array;
  }

  #queryReturnArrayById({ result, valueKey, fnSanitize, fnValueSanitize }: QueryReturnKeyFnOpts) {
    let labelKey = Ofn.isNully(valueKey) || !(Ofn.isString(valueKey) || Ofn.isNumeric(valueKey)) ? 'id' : valueKey;
    if (Ofn.isNumeric(labelKey)) {
      labelKey = Ofn.issetGet<string>(result.columns[Number(valueKey)], 'name', 'id');
    }

    const objArray: Record<string, any> = {};
    for (const row of result) {
      if (row[labelKey as string] === undefined) {
        continue;
      }

      if (fnSanitize || fnValueSanitize) {
        let sanitizedRow: Record<string, any> = fnValueSanitize ? {} : row;
        if (fnValueSanitize) {
          const rowKeys = Object.keys(row);
          for (const key of rowKeys) {
            sanitizedRow[key] = fnValueSanitize(row[key], key);
          }
        }
        if (fnSanitize) {
          sanitizedRow = fnSanitize(sanitizedRow);
        }

        objArray[String(sanitizedRow[labelKey as string])] = sanitizedRow;
      } else {
        objArray[row[labelKey as string]] = row;
      }
    }
    return objArray;
  }

  #queryReturnRow({ result, valueKey, fnSanitize, fnValueSanitize }: QueryReturnKeyFnOpts) {
    const labelKey = Ofn.isNully(valueKey) || !Ofn.isNumeric(valueKey) ? 0 : Number(valueKey);

    const objResult = result[labelKey];

    if (objResult === undefined || (!fnSanitize && !fnValueSanitize)) {
      return objResult;
    }

    const objRow: Record<string, any> = fnValueSanitize ? {} : objResult;
    if (fnValueSanitize) {
      const rowKeys = Object.keys(objResult || {});
      for (const key of rowKeys) {
        objRow[key] = fnValueSanitize(objResult[key], key);
      }
    }

    return fnSanitize ? fnSanitize(objRow) : objRow;
  }

  #queryReturnRowStrict({ result, valueKey, fnSanitize, fnValueSanitize }: QueryReturnKeyFnOpts) {
    const labelKey = Ofn.isNully(valueKey) || !Ofn.isNumeric(valueKey) ? 0 : Number(valueKey);

    const objResult = result[labelKey];
    if (objResult === undefined) {
      return objResult;
    }

    const objRowStrict: Record<string, any> = {};
    const rowStrictKeys = Object.keys(objResult || {});
    for (const key of rowStrictKeys) {
      const value = fnValueSanitize ? fnValueSanitize(objResult[key], key) : objResult[key];
      if (!value) {
        continue;
      }

      objRowStrict[key] = value;
    }

    return fnSanitize ? fnSanitize(objRowStrict) : objRowStrict;
  }

  #dbQuery = async (query: string) => {
    const resultArray = new ResultArray();
    resultArray.statement = query;

    if (!this.#serverStatus.status || !this.#db) {
      resultArray.status = false;
      resultArray.error = {
        type: 'server-down',
        msg: 'Server is down',
        serverStatus: this.getStatus(),
      };

      this.#lastResult = resultArray;
      this.#queryHistory.push(this.#lastResult);

      return resultArray;
    }

    await this.#db
      .query(query)
      .then((result: any) => {
        if (Ofn.type(result[0]) === 'object') {
          resultArray.columns.push(Ofn.cloneObject(result[0]));
          resultArray.count = result[0].affectedRows;
          resultArray.status = true;
          return;
        }

        // SELECT

        for (const item of result[0]) {
          resultArray.push(item);
        }

        if (result[1]) {
          for (const item of result[1]) {
            const column = Ofn.cloneObjectWithKeys(item, DB_COLUMNS) as ResultArrayColumn;
            resultArray.columns.push(column);
          }
        }

        resultArray.count = result[0].length;
        resultArray.status = true;
      })
      .catch((error: any) => {
        const errorArray = error.toString().split('\r\n');
        resultArray.status = false;
        resultArray.error = {
          type: 'wrong-query',
          msg: errorArray[0].replace(/\n/g, ' '),
          mysql: errorArray,
        };
      });

    this.#lastResult = resultArray;
    this.#queryHistory.push(this.#lastResult);

    return resultArray;
  };
}
