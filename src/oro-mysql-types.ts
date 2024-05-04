import type { ConnectionOptions } from 'mysql2';
import type { SResponseKOObject, SResponseOKObject, SResponseOKSimple } from 'oro-functions-client';
import type { OTimer, OTimerStep } from 'oro-timer';
import type { ResultArray } from 'result-array';

export type OMysqlQueryFormat =
  | 'default'
  | 'id'
  | 'bool'
  | 'count'
  | 'value'
  | 'values'
  | 'valuesById'
  | 'array'
  | 'arrayById'
  | 'row'
  | 'rowStrict';

export type OMysqlConfig = ConnectionOptions;

export interface OMysqlPoolOpenInput {
  oTimer?: OTimer;
  oTimerOpen?: string;
}

export interface OMysqlPoolCloseInput {
  oTimer?: OTimer;
  oTimerClose?: string;
}

export interface OMysqlServerStatusError {
  msg: string;
  times?: OTimerStep[];
}

export type OMysqlServerStatus = SResponseOKSimple | SResponseKOObject<OMysqlServerStatusError>;

export interface OMysqlQueryOnceObject<T> {
  result: T;
}

export type OMysqlQueryOnceResponse<T> =
  | SResponseOKObject<OMysqlQueryOnceObject<T>>
  | SResponseKOObject<OMysqlServerStatusError>;

export interface OMysqlQueryOpts {
  format?: OMysqlQueryFormat;
  valueKey?: string | number;
  valueId?: string | number;
  fnSanitize?: (...args: any[]) => any;
  fnValueSanitize?: (...args: any[]) => any;
}

// default

export interface OMysqlQueryDefaultOpts {
  format?: 'default';
}

export type OMysqlQueryDefaultOutput = ResultArray;

// bool

export interface OMysqlQueryBoolOpts {
  format: 'bool';
}

export type OMysqlQueryBoolOutput = boolean;

export interface OMysqlQueryBoolFnOpts<T> {
  format: 'bool';
  fnSanitize: (result: boolean) => T;
}

export type OMysqlQueryBoolFnOutput<T> = T | false;

// count

export interface OMysqlQueryCountOpts {
  format: 'count';
}

export type OMysqlQueryCountOutput = number | false;

export interface OMysqlQueryCountFnOpts<T> {
  format: 'count';
  fnSanitize: (result: number) => T;
}

export type OMysqlQueryCountFnOutput<T> = T | false;

// id

export interface OMysqlQueryIdOpts {
  format: 'id';
}

export type OMysqlQueryIdOutput = number | false;

export interface OMysqlQueryIdFnOpts<T> {
  format: 'id';
  fnSanitize: (result: number) => T;
}

export type OMysqlQueryIdFnOutput<T> = T | false;

// value

export interface OMysqlQueryValueOpts {
  format: 'value';
  valueKey?: string | number;
}

export type OMysqlQueryValueOutput<T> = T | undefined | false;

export interface OMysqlQueryValueFnOpts<T> {
  format: 'value';
  valueKey?: string | number;
  fnSanitize: (value: any) => T;
}

export type OMysqlQueryValueFnOutput<T> = T | false;

// values

export interface OMysqlQueryValuesOpts {
  format: 'values';
  valueKey?: string | number;
}

export type OMysqlQueryValuesOutput<T> = Array<T | undefined> | false;

export interface OMysqlQueryValuesFnOpts<T> {
  format: 'values';
  valueKey?: string | number;
  fnSanitize: (value: any) => T;
}

export type OMysqlQueryValuesFnOutput<T> = Array<T> | false;

// valuesById

export interface OMysqlQueryValuesByIdOpts {
  format: 'valuesById';
  valueKey?: string | number;
  valueId?: string | number;
}

export type OMysqlQueryValuesByIdOutput<T> = Record<string, T | undefined> | false;

export interface OMysqlQueryValuesByIdFnOpts<T> {
  format: 'valuesById';
  valueKey?: string | number;
  valueId?: string | number;
  fnSanitize: (value: any) => T;
}

export type OMysqlQueryValuesByIdFnOutput<T> = Record<string, T> | false;

// array

export interface OMysqlQueryArrayOpts {
  format: 'array';
}

export type OMysqlQueryArrayOutput<T> = T[] | false;

export interface OMysqlQueryArrayFnOpts<T> {
  format: 'array';
  fnSanitize?: (object: Record<string, any>) => T;
  fnValueSanitize?: (value: any, key: string) => any;
}

export type OMysqlQueryArrayFnOutput<T> = T[] | false;

// arrayById

export interface OMysqlQueryArrayByIdOpts {
  format: 'arrayById';
  valueKey?: string | number;
}

export type OMysqlQueryArrayByIdOutput<T> = Record<string, T> | false;

export interface OMysqlQueryArrayByIdFnOpts<T> {
  format: 'arrayById';
  valueKey?: string | number;
  fnSanitize?: (object: Record<string, any>) => T;
  fnValueSanitize?: (value: any, key: string) => any;
}

export type OMysqlQueryArrayByIdFnOutput<T> = Record<string, T> | false;

// row

export interface OMysqlQueryRowOpts {
  format: 'row';
  valueKey?: number;
}

export type OMysqlQueryRowOutput<T> = T | undefined | false;

export interface OMysqlQueryRowFnOpts<T> {
  format: 'row';
  valueKey?: number;
  fnSanitize?: (object: Record<string, any>) => T;
  fnValueSanitize?: (value: any, key: string) => any;
}

export type OMysqlQueryRowFnOutput<T> = T | undefined | false;

// rowStrict

export interface OMysqlQueryRowStrictOpts {
  format: 'rowStrict';
  valueKey?: number;
}

export type OMysqlQueryRowStrictOutput<T> = T | undefined | false;

export interface OMysqlQueryRowStrictFnOpts<T> {
  format: 'rowStrict';
  valueKey?: number;
  fnSanitize?: (object: Record<string, any>) => T;
  fnValueSanitize?: (value: any, key: string) => any;
}

export type OMysqlQueryRowStrictFnOutput<T> = T | undefined | false;
