# Oro Mysql

- [Overview](#overview)
- [Installation](#installation)
- [Example](#example)
- [Methods](#methods)
- [Testing](#testing)

## Overview

OroMysql Class is a wrapper of npm-mysql2 to simplify their use, allowing async/await and custom output format.

[npm-mysql2](https://www.npmjs.com/package/mysql2) is a Mysql API Wrapper for node.js.

## Installation

```shell
npm install oro-mysql
```

## Example:

```js
// cjs
const { OMysql } = require( 'oro-mysql' );

// mjs, ts
import { OMysql } from 'oro-mysql';

//

const config = {
  host: 'localhost',
  database: 'custom-database',
  user: 'custom-user',
  password: 'custom-password',
}

const sqlClient = new OMysql( config );

const poolOpen = await sqlClient.poolOpen();
if( ! poolOpen.status ) { return poolOpen; }

const rows = await sqlClient.query( "SELECT * FROM table", 'array' );
// [ row, ... ]

const row = await sqlClient.query( "SELECT * FROM table WHERE id = 7", 'row' );
// { columnKey: columnValue, ... }

await sqlClient.poolClose();
```

## Methods

<hr>

- [new OMysql()](#new-omysql)
- [await .poolOpen()](#await-poolopen)
- [await .poolClose()](#await-poolclose)
- [.getClient()](#getclientbrstatic-omysqlgetclient)
- [.getDB()](#getdb)
- [.getInfo()](#getinfo)
- [.getStatus()](#getstatusbrstatus)
- [.getAllQueries()](#getallqueries)
- [.clearQueries()](#clearqueries)
- [.getLastQuery()](#getlastquery)
- [.getFirstQuery()](#getfirstquery)
- [.getAffectedRows()](#getaffectedrows)
- [.sanitize()](#sanitizebrstatic-omysqlsanitize)
- [await .pqueryOnce()](#await-pqueryonce)
- [await .pquery()](#await-pquery)
- [await .queryOnce()](#await-queryonce)
- [await .query()](#await-query)
  - [ResultArray](#resultarray)
  - [(await .query) Format uses](#await-query-format-uses)

<hr>

### new OMysql()

```ts
new OMysql( config?: OMysqlConfig );

type OMysqlConfig = mysql2.ConnectionOptions &  {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
}
```

```js
const { OMysql } = require('oro-mysql');

const config = {
  host: 'localhost',
  database: '',
  user: 'root',
  password: '',
};

const sqlClient = new OMysql(config);
```

<hr>

### await .poolOpen()

```ts
await sqlClient.poolOpen(args?: OMysqlPoolOpenInput): Promise<OMysqlServerStatus>

interface OMysqlPoolOpenInput {
   oTimer?: OTimer;
   oTimerOpen?: string;
}

type OMysqlServerStatus =
  | SResponseOKSimple
  | SResponseKOObject<OMysqlServerStatusError>

interface SResponseOKSimple {
   status: true;
   msg: string;
}

interface SResponseKOObject {
   status: false;
   error: {
      msg: string;
      times?: OTimerStep[];
   }
}

interface OMysqlServerStatusError {
   msg: string;
   times?: OTimerStep[];
}
```

When pool is opened, the connection to database is created to execute queries.

```js
const poolOpen = await sqlClient.poolOpen();

console.log(poolOpen);
// -> { status: true, msg: 'Connected successfully.' }
// -> { status: false, error: { msg: 'Error reason' } }
```

<hr>

### await .poolClose()

```ts
await sqlClient.poolClose(args?: OMysqlPoolCloseInput): Promise<SResponseOKSimple>

interface OMysqlPoolOpenInput {
   oTimer?: OTimer;
   oTimerClose?: string;
}

interface SResponseOKSimple {
   status: true;
   msg: string;
}
```

To close the opened pool.

```js
const poolOpen = await sqlClient.poolOpen();

console.log(poolOpen);
// -> { status: true, msg: 'Disconnected successfully.' }
```

<hr>

### .getClient()<br>static OMysql.getClient()

```ts
sqlClient.getClient(): mysql2/promise
// or
static OMysql.getClient(): mysql2/promise
```

If you want to use the library `mysql2/promise`, you can get it.

```js
const mysql = sqlClient.getClient();

// or from static

const mysql = OMysql.getClient();
```

<hr>

### .getDB()

```ts
sqlClient.getDB(): mysql.Connection | undefined
```

When pool is opened, you can get the `npm-mysql conn` object.

```js
const db = sqlClient.getDB();
// use mysql2/promise Connection
```

<hr>

### .getInfo()

```ts
sqlClient.getInfo(): OMysqlConfig

type OMysqlConfig = mysql2.ConnectionOptions &  {
   host?: string;
   port?: number;
   database?: string;
   user?: string;
   password?: string;
}
```

Get _config_ info (with password setted as asterisk).

```js
const info = sqlClient.getInfo();

console.log(info);
// -> {
//   host: 'localhost',
//   user: 'username'
//   password: '********'
// }
```

<hr>

### .getStatus()<br>.status

```ts
sqlClient.getStatus(): OMysqlServerStatus

type OMysqlServerStatus =
  | SResponseOKSimple
  | SResponseKOObject<OMysqlServerStatusError>

interface SResponseOKSimple {
   status: true;
   msg: string;
}

interface SResponseKOObject {
   status: false;
   error: {
      msg: string;
      times?: OTimerStep[];
   }
}

interface OMysqlServerStatusError {
   msg: string;
   times?: OTimerStep[];
}
```

Get the status object. If status is false, show the error message.

`status` is only `true` when pool is opened and it's enabled to call a query.

```js
const statusObj = sqlClient.getStatus();

console.log(statusObj);
// -> { status: true }
```

Another way to simplify getting the _boolean_ status is directly with using the property `sqlCLient.status`.

```js
console.log(sqlCLient.status);
// -> true | false
```

<hr>

### .getAllQueries()

```ts
sqlClient.getAllQueries(raw?: boolean = false): ResultArray[]
```

Get all [resultArray](#resultarray) of the queries that have been done.

<small>**Note**: By default, you get a _deep copy_ of each `resultArray` to avoid modifying data,
but if you need a better performance and you understand what are you doing,
you can get the `resultArray` as _shallow copy_ (with `raw = true`).</small>

```js
const allResults = sqlClient.getAllQueries();

console.log(allResults);
// -> [ resultArray, ... ]
```

<hr>

### .clearQueries()

```ts
sqlClient.clearQueries(): number
```

To reset the _queryHistory_ to zero.

<small>**Note**: By default, every query that is executed is saved in sqlClient,
so to avoid _memory issues_ it's recommended to clear them if there are going to be a lot of them.</small>

```js
const removed = sqlClient.clearQueries();

console.log(removed);
// -> 3
```

<hr>

### .getLastQuery()

```ts
sqlClient.getLastQuery(offset = 0, raw = false): ResultArray
```

Get the last [resultArray](#resultarray) of the queries, with the param `offset` you can get the preceding queries.

<small>**Note**: By default, you get a _deep copy_ of the `resultArray` to avoid modifying data,
but if you need a better performance and you understand what are you doing,
you can get the `resultArray` as _shallow copy_ (with `raw = true`).</small>

```js
const lastResult = sqlClient.getLastQuery();

console.log(lastResult);
// -> resultArray
```

<hr>

### .getFirstQuery()

```ts
sqlClient.getFirstQuery(offset = 0, raw = false): ResultArray
```

Get the first [resultArray](#resultarray) of the queries, with the param `offset` you can get the following queries.

<small>**Note**: By default, you get a _deep copy_ of the `resultArray` to avoid modifying data,
but if you need a better performance and you understand what are you doing,
you can get the `resultArray` as _shallow copy_ (with `raw = true`).</small>

```js
const firstResult = sqlClient.getFirstQuery();

console.log(firstResult);
// -> resultArray
```

<hr>

### .getAffectedRows()

```ts
sqlClient.getAffectedRows(): number
```

Get the total number of rows that are affected in the last query.

```js
const count = sqlClient.getAffectedRows();

console.log(count);
// -> 1
```

<hr>

### .sanitize()<br>static Omysql.sanitize()

```ts
sqlClient.sanitize(value: any): string
// or
OMysql.sanitize(value: any): string
```

Sanitize the value to avoid _code injections_.

```js
const valNumber = sqlClient.sanitize(20);
console.log(valNumber);
// -> `20`

const valString = sqlClient.sanitize('chacho');
console.log(valString);
// -> `'chacho'`

const valInjection = sqlClient.sanitize("' OR 1 = 1");
console.log(valInjection);
// -> `'\' OR 1 = 1'`
```

<hr>

### await .pqueryOnce()

> [!WARNING]  
> Deprecated: use [await .queryOnce()](#await-queryonce) instead.

```ts
await sqlClient.pqueryOnce(
  query: string,
  format: OMysqlQueryFormat = 'default',
  valueKey: string | number = 0,
  valueId: string | number = 0,
  fnSanitize?: Function,
): Promise<OMysqlQueryOnceResponse<any>>

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

type OMysqlQueryOnceResponse<T> =
  | SResponseOKObject<OMysqlQueryOnceObject<T>> // result of [await .pquery()](#await-pquery)
  | SResponseKOObject<OMysqlServerStatusError>; // error of [await .poolOpen()](#await-poolopen)

interface SResponseOKObject<T> {
  status: true;
  result: T;
}

OMysqlQueryOnceObject<T> {
   result: T;
}
```

If you just need to call only _one query_, this function calls `poolOpen() & pquery() & poolClose()` respectively.

_Note:_ Better use [await .queryOnce()](#await-queryonce)

By default the returned format value is [resultArray](#resultarray).<br>
But, depends on format parameter, it returns a different result value.<br>
To understand each format, please review [(await .query) Format uses](#await-query-format-uses).

<hr>

### await .pquery()

> [!WARNING]  
> Deprecated: use [await .query()](#await-query) instead.

```ts
await sqlClient.pquery<T>(
  query: string,
  format: OMysqlQueryFormat = 'default',
  valueKey: string | number = 0,
  valueId: string | number = 0,
  fnSanitize?: Function,
): Promise<any>

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
```

_Note:_ Better use [await .query()](#await-query)

By default the returned format value is [resultArray](#resultarray).<br>
But, depends on format parameter, it returns a different result value.<br>
To understand each format, please review [(await .query) Format uses](#await-query-format-uses).

**Parameters:**

1. **query**: String `"SELECT * FROM table"`.
2. **format**: String, Allowed values: `default`,`id`,`bool`,`count`,`value`,`values`,`valuesById`,`array`,`arrayById`,`rowStrict`,`row`.
3. **valueKey**: String|Number, name or position of the column to get the value.
4. **valueId**: String|Number, name or position of the column to use as param.
5. **fnSanitize**: Null|Function, function to map every value.
   <br><small>Note: If _format_ is `row|array`, it maps every column-value (**fnValueSanitize**), not the whole object.</small>

<hr>

### await .queryOnce()

```ts
await sqlClient.queryOnce(query: string, opts?: OMysqlQueryOpts): Promise<OMysqlQueryOnceResponse<any>>

interface OMysqlQueryOpts { // as [await .query()](#await-query)
   format?: OMysqlQueryFormat;
   valueKey?: string | number;
   valueId?: string | number;
   fnSanitize?: Function;
   fnValueSanitize?: Function;
}

type OMysqlQueryOnceResponse<T> =
  | SResponseOKObject<OMysqlQueryOnceObject<T>>
  | SResponseKOObject<OMysqlServerStatusError>; // error of [await .poolOpen()](#await-poolopen)

interface SResponseOKObject<T> {
  status: true;
  result: T;
}

OMysqlQueryOnceObject<T> {
   result: T;
}
```

If you just need to call only _one query_, this function calls `poolOpen() & query() & poolClose()` respectively.

By default the returned format value is [resultArray](#resultarray).<br>
But, depends on format parameter, it returns a different result value.<br>
To understand each format, please review [(await .query) Format uses](#await-query-format-uses).

<hr>

### await .query()

```ts
await sqlClient.queryOnce(query: string, opts?: OMysqlQueryOpts): Promise<any>

interface OMysqlQueryOpts {
   format?: OMysqlQueryFormat;
   valueKey?: string | number;
   valueId?: string | number;
   fnSanitize?: Function;
   fnValueSanitize?: Function;
}

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
```

> [!NOTE]  
> Each format returns a different result format.

By default the returned format value is [resultArray](#resultarray).<br>
But, depends on format parameter, it returns a different result value.<br>
To understand each format, please review [(await .query) Format uses](#await-query-format-uses).

**Parameters:**

**_query:_** _String_, `"SELECT * FROM table"`.

**_options:_**

1. **format**: _String_, Allowed values: `default`,`id`,`bool`,`count`,`value`,`values`,`valuesById`,`array`,`arrayById`,`row`,`rowStrict`.
2. **valueKey**: _String | Number_, name or position of the column to get the value.
3. **valueId**: _String | Number_, name or position of the column to use as param.
4. **fnSanitize**: _Null | Function_, function to map every value.
5. **fnValueSanitize**: _Null | Function_, if _format_ is `row` or `array`, it maps every column-value, not the whole object-value.

<hr>

#### ResultArray

```ts
class ResultArray extends Array {
  public status: true;
  public count: number;
  public statement: string;
  public columns: any[];
}

class ResultArray extends Array {
  public status: false;
  public statement: string;
  public error: ResultArrayError;
}

interface ResultArrayError extends Record<string, any> {
  type: ResultArrayErrorType;
  msg: string;
}

type ResultArrayErrorType =
  | 'server-down'
  | 'wrong-format'
  | 'wrong-fnsanitize'
  | 'wrong-fnvaluesanitize'
  | 'wrong-query';
```

By default the returned data from a _.query()_ is `resultArray`.

This class extends from `Array` and it has extra params.

```js
{
  status = true || false,
  count = 0, // affected row
  statement = 'QUERY';
  columns = []; // table columns data
  error?: { // only when status is false
      type: 'error type',
      msg: 'error reason',
      ...
  }
}
```

<hr>

#### (await .query) Format uses

- [Format use: `default`](#await-query-format-default)
- [Format use: `id`](#await-query-format-id)
- [Format use: `bool`](#await-query-format-bool)
- [Format use: `count`](#await-query-format-count)
- [Format use: `value`](#await-query-format-value)
- [Format use: `values`](#await-query-format-values)
- [Format use: `valuesById`](#await-query-format-valuesbyid)
- [Format use: `array`](#await-query-format-array)
- [Format use: `arrayById`](#await-query-format-arraybyid)
- [Format use: `row`](#await-query-format-row)
- [Format use: `rowStrict`](#await-query-format-rowstrict)

<hr>

##### (await .query) Format: `default`

```ts
await sqlClient.query(query: string, opts?: OMysqlQueryDefaultOpts): Promise<ResultArray>

interface OMysqlQueryDefaultOpts {
  format?: 'default';
}
```

It returns always a [resultArray](#resultarray).

✔️ When query is valid, `result.status` is `true`.<br>
❌ When query fails, `result.status` is `false`.

```js
const resultArray = await sqlClient.query(`SELECT * FROM table`);
// ✔️ [
//   0: { ... },
//   1: { ... }
//   status: true,
//   statement: 'SELECT * FROM table',
//   count: 2,
//   columns: [ ... ]
// ]
//
// ❌ [
//   status: false,
//   statement: 'SELECT * FROM table',
//   error: {
//     type: 'wrong-query';
//     msg: 'MYSQL error reason';
//   }
// ]
```

<hr>

##### (await .query) Format: `id`

```ts
await sqlClient.query(query: string, opts: OMysqlQueryIdOpts): Promise<number | false>

interface OMysqlQueryIdOpts {
  format: 'id';
}

// OR

await sqlClient.query<T>(query: string, opts: OMysqlQueryIdFnOpts<T>): Promise<T | false>

interface OMysqlQueryIdFnOpts<T> {
  format: 'id';
  fnSanitize: (value: number) => T;
}
```

If the query is an _INSERT_ and the table has an `AUTO_INCREMENT` value (usually used as _primary key_),
this _incremented value_ is returned as `id`.

✔️ When query is valid, `result` is type `number`.<br>
⚠️ When query is valid and there is no _auto-increment value_, `result` is `0`.<br>
✔️ When query is valid with _fnSanitize_:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· function-input is type `number`,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· function-output is type `T` (`result`).<br>
❌ When query fails, `result` is `false`.

```js
const id = await sqlClient.query( `INSERT INTO table VALUES ( ... )`, { format: 'id' } );
// ✔️ -> 17
// ❌ -> false

// OR

const id = await sqlClient.query( `INSERT INTO table VALUES ( ... )`, {
    format: 'id',
    fnSanitize: (value: number) => `id-${value}`
} );
// ✔️ -> 'id-17'
// ❌ -> false

// OR

// when there is no auto-increment column
const id = await sqlClient.query( `INSERT INTO table VALUES ( ... )`, {
    format: 'id',
} );
// ✔️ -> 0
// ❌ -> false
```

<hr>

##### (await .query) Format: `bool`

```ts
await sqlClient.query(query: string, opts: OMysqlQueryBoolOpts): Promise<boolean>

interface OMysqlQueryBoolOpts {
  format: 'bool';
}

// OR

await sqlClient.query<T>(query: string, opts: OMysqlQueryBoolFnOpts<T>): Promise<T | false>

interface OMysqlQueryBoolFnOpts<T> {
  format: 'bool';
  fnSanitize: (value: boolean) => T;
}
```

✔️ When query is valid and there is any affected row, `result` is `true`.<br>
✔️ When query is valid and there aren't affected rows, `result` is `false`.<br>
✔️ When query is valid with _fnSanitize_:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· function-input is type `boolean`,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· function-output is type `T` (`result`).<br>
❌ When query fails, `result` is `false`.

- `bool`, if the query has _affected rows_ it returned `true`.

```js
const bool = await sqlClient.query( `UPDATE table SET value WHERE condition`, { format: 'bool' } );
// ✔️ -> true | false
// ❌ -> false

// OR

const bool = await sqlClient.query( `UPDATE table SET value WHERE condition`, {
    format: 'bool',
    fnSanitize: (value: boolean) => Number(value)
} );
// ✔️ -> 1 | 0
// ❌ -> false
```

<hr>

##### (await .query) Format: `count`

```ts
await sqlClient.query(query: string, opts: OMysqlQueryCountOpts): Promise<number | false>

interface OMysqlQueryCountOpts {
  format: 'count';
}

// OR

await sqlClient.query<T>(query: string, opts: OMysqlQueryCountFnOpts<T>): Promise<T | false>

interface OMysqlQueryCountFnOpts<T> {
  format: 'count';
  fnSanitize: (value: number) => T;
}
```

✔️ When query is valid, `result` is the `number` of affected rows.<br>
✔️ When query is valid with _fnSanitize_:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· function-input is type `number`,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· function-output is type `T` (`result`).<br>
❌ When query fails, `result` is `false`.

```js
const count = await sqlClient.query( `SELECT '' FROM table`, { format: 'count' } );
// ✔️ -> 2
// ❌ -> false

// OR

const count = await sqlClient.query( `SELECT '' FROM table`, {
    format: 'count',
    fnSanitize: (value: number) => value === 0 ? 'No' : 'Yes'
} );
// ✔️ -> 'No' | 'Yes'
// ❌ -> false
```

<hr>

##### (await .query) Format: `value`

```ts
await sqlClient.query<T>(query: string, opts: OMysqlQueryValueOpts): Promise<T | undefined | false>

interface OMysqlQueryValueOpts {
  format: 'value';
  valueKey?: string | number;
}

// OR

await sqlClient.query<T>(query: string, opts: OMysqlQueryValueFnOpts<T>): Promise<T | false>

interface OMysqlQueryValueFnOpts<T> {
  format: 'value';
  valueKey?: string | number;
  fnSanitize: (value: any) => T;
}
```

✔️ When query is valid and there is any affected row, it only takes the first row and
`result` is the value of the `valueKey` column<sup>\*️⃣</sup> (typed as `T`).<br>
⚠️ When query is valid and there aren't affected rows, `result` is `undefined`.<br>
✔️ When query is valid with _fnSanitize_:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· function-input is the value of the `valueKey` column,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· function-output is type `T` (`result`).<br>
❌ When query fails, `result` is `false`.

_\*️⃣ Notes:_<br>

1. If `valueKey` is type _string_, then it references to the _column name_.<br>
2. If `valueKey` is type _number_, then it references to the _column position_.

```js
const value = await sqlClient.query( "SELECT column1, column2 FROM table", { format: 'value' } );
// ✔️ -> column1-value
// ❌ -> false

// OR

const value = await sqlClient.query( "SELECT column1, column2 FROM table WHERE 0 = 1", { format: 'value' } );
// ✔️ -> undefined
// ❌ -> false

// OR

const value = await sqlClient.query( "SELECT column1, column2 FROM table", { format: 'value', valueKey: 'column2' } );
// ✔️ -> column2-value
// ❌ -> false

// OR

const value = await sqlClient.query( "SELECT column1, column2 FROM table", { format: 'value', valueKey: 'column3' } );
// ✔️ -> undefined
// ❌ -> false

// OR

const value = await sqlClient.query( "SELECT column1, column2 FROM table", { format: 'value', valueKey: 1 } );
// ✔️ -> column2-value
// ❌ -> false

// OR

const value = await sqlClient.query( "SELECT count(*) FROM table", {
    format: 'value',
    fnSanitize: (value: number) => `Total rows: ${value}.`
} );
// ✔️ -> 'Total rows: 17.'
// ❌ -> false
```

<hr>

##### (await .query) Format: `values`

```ts
await sqlClient.query<T>(query: string, opts: OMysqlQueryValuesOpts): Promise<Array<T | undefined> | false>

interface OMysqlQueryValuesOpts {
  format: 'values';
  valueKey?: string | number;
}

// OR

await sqlClient.query<T>(query: string, opts: OMysqlQueryValuesFnOpts<T>): Promise<Array<T> | false>

interface OMysqlQueryValuesFnOpts<T> {
  format: 'values';
  valueKey?: string | number;
  fnSanitize: (value: any) => T;
}
```

✔️ When query is valid and there is any affected row, it takes all rows and
`result` is an array of every _value_ of `valueKey` column<sup>\*️⃣</sup> with type `T`.<br>
⚠️ When query is valid and there aren't affected rows, `result` is an empty array `[]`.<br>
✔️ When query is valid with _fnSanitize_:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· function-input is the value of every `valueKey` column,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· function-output is type `T` (and `result` is `T[]`).<br>
❌ When query fails, `result` is `false`.

_\*️⃣ Notes:_<br>

1. If `valueKey` is type _string_, then it references to the _column name_.<br>
2. If `valueKey` is type _number_, then it references to the _column position_.

```js
const values = await sqlClient.query( "SELECT column1, column2 FROM table", { format: 'values' } );
// ✔️ -> [ column1-value-of-row1, column1-value-of-row2, ... ]
// ❌ -> false

// OR

const values = await sqlClient.query( "SELECT column1, column2 FROM table WHERE 0 = 1", { format: 'values' } );
// ✔️ -> []
// ❌ -> false

// OR

const values = await sqlClient.query( "SELECT column1, column2 FROM table", { format: 'value', valueKey: 'column2' } );
// ✔️ -> [ column2-value-of-row1, column2-value-of-row2, ... ]
// ❌ -> false

// OR

const values = await sqlClient.query( "SELECT column1, column2 FROM table", { format: 'value', valueKey: 'column3' } );
// ✔️ -> [ undefined, undefined, ... ]
// ❌ -> false

// OR

const values = await sqlClient.query( "SELECT column1, column2 FROM table", { format: 'value', valueKey: 1 } );
// ✔️ -> [ column2-value-of-row1, column2-value-of-row2, ... ]
// ❌ -> false

// OR

const values = await sqlClient.query( "SELECT column_optional FROM table", {
    format: 'value',
    fnSanitize: (value: string | null) => value === null ? 'default' : value
} );
// ✔️ -> [ 'value1', 'default', ... ]
// ❌ -> false
```

<hr>

##### (await .query) Format: `valuesById`

```ts
await sqlClient.query<T>(query: string, opts: OMysqlQueryValuesByIdOpts): Promise<Record<string, T | undefined> | false>

interface OMysqlQueryValuesByIdOpts {
  format: 'valuesById';
  valueKey?: string | number;
  valueId?: string | number;
}

// OR

await sqlClient.query<T>(query: string, opts: OMysqlQueryValuesByIdFnOpts<T>): Promise<Record<string, T> | false>

interface OMysqlQueryValuesByIdFnOpts<T> {
  format: 'valuesById';
  valueKey?: string | number;
  valueId?: string | number;
  fnSanitize: (value: any) => T;
}
```

✔️ When query is valid and there is any affected row, it takes all rows and
`result` is an object with:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· _`valueId` column-value_<sup>*️⃣</sup> as key,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· *`valueKey` column-value*<sup>*️⃣</sup> as value.<br>
✔️ When query is valid and there aren't affected rows, `result` is an empty object `{}`.<br>
✔️ When query is valid with _fnSanitize_:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· function-input is the value of every `valueKey` column,<br>
❌ When query fails, `result` is `false`.

_\*️⃣ Notes:_<br>

1. If `valueKey` or `valueId` is type _string_, then it references to the _column name_.<br>
2. If `valueKey` or `valueId` is type _number_, then it references to the _column position_.

```js
const valuesById = await sqlClient.query( "SELECT user_id, user_name FROM table", {
    format: 'valuesById',
    valueKey: 'user_name',
    valueId: 'user_id'
} );
// ✔️ -> { userID1: 'User Name 1', userID2: 'User Name 2', ... }
// ❌ -> false

// OR

const valuesById = await sqlClient.query( "SELECT user_id, user_name FROM table", {
    format: 'valuesById',
    valueKey: 'user_name',
    valueId: 'user_id',
    fnSanitize: (userName: string | null) => userName === null ? 'User Default' : userName
} );
// ✔️ -> { userID1: 'User Name 1', userID2: 'User Default', ... }
// ❌ -> false
```

<hr>

##### (await .query) Format: `array`

```ts
await sqlClient.query<T>(query: string, opts: OMysqlQueryArrayOpts): Promise<T[] | false>

interface OMysqlQueryArrayOpts {
  format: 'array';
}

// OR

await sqlClient.query<T>(query: string, opts: OMysqlQueryArrayFnOpts<T>): Promise<T[] | false>

interface OMysqlQueryArrayFnOpts<T> {
  format: 'array';
  fnSanitize?: (object: Record<string, any>) => T;
  fnValueSanitize?: (value: any, key: string) => any;
}
```

✔️ When query is valid, it returns an array of rows.<br>
⚠️ When query is valid and there aren't affected rows, `result` is an empty array `[]`.<br>
✔️ When query is valid with _fnSanitize_:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· function-input is each `row`.<br>
✔️ When query is valid with _fnValueSanitize_:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· function-input is every `column-value, column-key` of each `row`.<br>
❌ When query fails, `result` is `false`.

```js
const array = await sqlClient.query( "SELECT * FROM table", { format: 'array' } );
// ✔️ -> [ row1, row2, ... ]
// ❌ -> false

// OR

const array = await sqlClient.query( "SELECT * FROM table", {
    format: 'array',
    fnValueSanitize: (value: any) => value === null ? undefined : value,
    fnSanitize: (row: any) => { row.fullname = `${row.name} ${row.lastname}`; return row; }
} );
// ✔️ -> [ customized-row1, customized-row2, ... ]
// ❌ -> false
```

<hr>

##### (await .query) Format: `arrayById`

```ts
await sqlClient.query<T>(query: string, opts: OMysqlQueryArrayByIdOpts): Promise<Record<string, T> | false>

interface OMysqlQueryArrayByIdOpts {
  format: 'arrayById';
  valueKey?: string | number;
}

// OR

await sqlClient.query<T>(query: string, opts: OMysqlQueryArrayFnOpts<T>): Promise<Record<string, T> | false>

interface OMysqlQueryArrayFnOpts<T> {
  format: 'arrayById';
  valueKey?: string | number;
  fnSanitize?: (object: Record<string, any>) => T;
  fnValueSanitize?: (value: any, key: string) => any;
}
```

✔️ When query is valid, it returns an object where key is the value o of rows.<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· _`valueKey` column-value_<sup>\*️⃣</sup> as key,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· _The whole `row` as value.<br>
⚠️ When query is valid and there aren't affected rows, `result` is an empty object `{}`.<br>
✔️ When query is valid with \_fnSanitize_:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· function-input is each `row`.<br>
✔️ When query is valid with _fnValueSanitize_:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· function-input is every `column-value, column-key` of each `row`.<br>
❌ When query fails, `result` is `false`.

_\*️⃣ Notes:_<br>

1. If `valueKey` is type _string_, then it references to the _column name_.<br>
2. If `valueKey` is type _number_, then it references to the _column position_.

```js
const arrayById = await sqlClient.query( "SELECT * FROM table", {
    format: 'arrayById',
    valueKey: 'user_id',
} );
// ✔️ -> { userID1: row1, userID2: row2, ... }
// ❌ -> false

// OR

const arrayById = await sqlClient.query( "SELECT * FROM table", {
    format: 'arrayById',
    valueKey: 'user_id',
    fnValueSanitize: (value: any) => value === null ? undefined : value,
    fnSanitize: (row: any) => { row.fullname = `${row.name} ${row.lastname}`; return row; }
} );
// ✔️ -> { userID1: customRow1, userID2: customRow2, ... }
// ❌ -> false
```

<hr>

##### (await .query) Format: `row`

```ts
await sqlClient.query<T>(query: string, opts: OMysqlQueryRowOpts): Promise<T | undefined | false>

interface OMysqlQueryRowOpts {
  format: 'row';
  valueKey?: number;
}

// OR

await sqlClient.query<T>(query: string, opts: OMysqlQueryRowFnOpts<T>): Promise<T | undefined | false>

interface OMysqlQueryRowFnOpts<T> {
  format: 'row';
  valueKey?: number;
  fnSanitize?: (object: Record<string, any>) => T;
  fnValueSanitize?: (value: any, key: string) => any;
}
```

✔️ When query is valid, it returns the row object as `result`.<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· `valueKey` (default `0`) is the position number of the query-array.<br>
⚠️ When query is valid and there aren't affected rows, `result` is `undefined`.<br>
⚠️ When query is valid, there are affected rows, but `valueKey` is higher than `query-array.length`, `result` is `undefined`.<br>
✔️ When query is valid with _fnSanitize_:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· function-input is the `row`.<br>
✔️ When query is valid with _fnValueSanitize_:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· function-input is every `column-value, column-key` of the `row`.<br>
❌ When query fails, `result` is `false`.

```js
const row = await sqlClient.query( "SELECT * FROM table WHERE id = $id", {
    format: 'row',
} );
// ✔️ -> row
// ❌ -> false

// OR

const row = await sqlClient.query( "SELECT * FROM table WHERE category = $category", {
    format: 'row',
    valueKey: 1,
} );
// ✔️ -> row2
// ❌ -> false

// OR

const row = await sqlClient.query( "SELECT * FROM table WHERE category = $category", {
    format: 'row',
    valueKey: 999,
} );
// ✔️ -> undefined
// ❌ -> false

// OR

const value = await sqlClient.query( "SELECT * FROM table WHERE id = $id", {
    format: 'row',
    fnValueSanitize: (value: any) => value === null ? undefined : value,
    fnSanitize: (row: any) => { row.fullname = `${row.name} ${row.lastname}`; return row; }
} );
// ✔️ -> customRow
// ❌ -> false
```

<hr>

##### (await .query) Format: `rowStrict`

```ts
await sqlClient.query<T>(query: string, opts: OMysqlQueryRowStrictOpts): Promise<T | undefined | false>

interface OMysqlQueryRowStrictOpts {
  format: 'rowStrict';
  valueKey?: number;
}

// OR

await sqlClient.query<T>(query: string, opts: OMysqlQueryRowStrictFnOpts<T>): Promise<T | undefined | false>

interface OMysqlQueryRowStrictFnOpts<T> {
  format: 'rowStrict';
  valueKey?: number;
  fnSanitize?: (object: Record<string, any>) => T;
  fnValueSanitize?: (value: any, key: string) => any;
}
```

✔️ When query is valid, it returns the row object **without columns with falsy values** as `result`.<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· `valueKey` (default `0`) is the position number of the query-array.<br>
⚠️ When query is valid and there aren't affected rows, `result` is `undefined`.<br>
⚠️ When query is valid, there are affected rows, but `valueKey` is higher than `query-array.length`, `result` is `undefined`.<br>
⚠️ When query is valid and the row has all the column-values as _falsy_, `result` is `{}`.<br>
✔️ When query is valid with _fnSanitize_:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· function-input is the `row`.<br>
✔️ When query is valid with _fnValueSanitize_:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· function-input is every `column-value, column-key` of the `row`.<br>
❌ When query fails, `result` is `false`.

> _Javascript falsy values_:<br>
>
> - false<br>
> - 0 (zero)<br>
> - '' or “” (empty string)<br>
> - null.<br>
> - undefined.<br>
> - NaN (number).<br>

```js
const row = await sqlClient.query( "SELECT * FROM table WHERE id = $id", {
    format: 'rowStrict',
} );
// ✔️ -> row without-falsy-columns
// ❌ -> false

// OR

const row = await sqlClient.query( "SELECT * FROM table WHERE category = $category", {
    format: 'rowStrict',
    valueKey: 1,
} );
// ✔️ -> row2 without-falsy-columns
// ❌ -> false

// OR

const row = await sqlClient.query( "SELECT * FROM table WHERE category = $category", {
    format: 'rowStrict',
    valueKey: 999,
} );
// ✔️ -> undefined
// ❌ -> false

// OR

const value = await sqlClient.query( "SELECT * FROM table WHERE id = $id", {
    format: 'row',
    fnValueSanitize: (value: any) => Ofn.isStringJson(value) ? JSON.parse(value) : value,
    fnSanitize: (row: any) => { row.fullname = `${row.name} ${row.lastname}`; return row; }
} );
// ✔️ -> customRow without-falsy-columns
// ❌ -> false
```

<hr>

## Testing

If you want to run `npm run test`, you can create your own `./test/config.json`
(you can copypaste it from `./test/config-default.json`).

```json
{
  "host": "localhost",
  "database": null,
  "user": "root",
  "password": ""
}
```

**ADVISE:** When running the testing process, the system automatically generates and deletes the 'test*oromysql' database,
so if `config.user` has not permission to create database, you should create the \_database* `test_oromysql` manually.

On the other hand, if in your _mysql_ already exist `test_oromysql` and it's required for you, avoid to `run test`.
