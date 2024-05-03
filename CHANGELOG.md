## 2.0.0 / 2024-05-03

**NOTE:**<br>
⚠️ It's not valid anymore:<br>`const sqlClient = new OMysql( { settings: config } );`,<br>
✔️ use the following instead:<br>`const sqlClient = new OMysql( config );`

**NOTE 2:**<br>
⚠️ In functions `sqlClient.query(q,f,k,i,f)`, `sqlClient.queryOnce(q,f,k,i,f)`, these parameters are not valid anymore,<br>
✔️ use the following parameters instead:
<br>`sqlClient.query(query, { format, valueKey, valueId, fnSanitize } )`
<br>`sqlClient.queryOnce(query, { format, valueKey, valueId, fnSanitize } )`
<br>or use the following functions <small>(add prefix _p_)</small>
<br>`sqlClient.pquery(q,f,k,i,f)`
<br>`sqlClient.pqueryOnce(q,f,k,i,f)`

**More changes**

- Added method `clearQueries` to reset `queryHistory` size to zero.
- Updated `queryHistory` direction having the last query at the end of the array (using `push` instead of `unshift` because it's faster).
- Refactored `*.js` to `src/*.ts`.
- Improved _typescript output declarations_.
- Updated _package_ as `type: "module"`.
- Added `tsup` and now _package_ is compiled to `cjs` _(common)_ and `mjs` _(module)_.
- Added _github actions_:
  - `validate_pr_to_master`
  - `npm_publish_on_pr_merge_to_master`.
- Added `husky` (to ensure only valid commits).
- Added `eslint` (and applied it).
- Added `prettier` (and applied it).
- Added _coverage_ for testing.
- Added _watcher_ for coding.
- Updated _libs_:
  - `mysql2` from `v2.3.3` to `v3.9.7`.
  - `oro-functions-client` from `v1.1.7` to `v2.2.2`.

## 1.0.3 / 2022-06-21

- Updated lib `oro-functions` to `v1.1.7`.
- Updated lib-dev `jest` to `v28.1.1`.

## 1.0.2 / 2022-06-01

- Updated `sanitize`, `boolean` is parsed to `tinyint (0|1)`; `null, undefined` is parsed to `NULL`; and `object`,`array` is parsed to `json stringify`.
- Updated `query`, when param _query_ failed and _format_ is `default`, it's returned `ResultArray`, else returned `false`.
- Updated `query`, when param _format_ is not allowed, or param _fnSanitize_ is not a function, it returns `false`.
- Added testing when `query` param _format_, _valueKey_, _valueId_ or _fnSanitize_ are wrong.

## 1.0.1 / 2022-05-31

- Fixed removing a forgotten console.log in `query, id`.
- Added testing of `query, fnSanitize`.

## 1.0.0 / 2022-05-31

- Added `MIT License`.
- Added _unit testing_ `Jest`.
- Added _package_ in `github.com` & `npmjs.com`.
- Added _fns_ `getFirstQuery`, `queryOnce`, improve security and performance.
- Updated lib `mysql2` to `v2.3.3`.
- Updated lib `oro-functions` to `v1.1.5`.

## 0.1.4 / 2021-11-16

- Update `oro-functions` to `1.0.1`.

## 0.1.3 / 2021-05-21

- Fixed method `query` when _format_ `valuesById` is numeric.

## 0.1.2 / 2021-04-05

- Fix data when _fnSanitize_ is called in methods `array`, `arrayById`, `rowStrict`, `row`.

## 0.1.1 / 2021-04-05

- Add method `sanitize` to avoid SQL injections.

## 0.0.3 / 2021-04-05

- Add `args.oTimer` in methods `.poolOpen()` and `.poolClose()` to use it automatically.
- Cast _raw_ `resultArray` to _object_ by default in methods `.getLastQuery()` and `.getAllQueries()`.

## 0.0.2 / 2021-03-29

- Added changelog.
- Fix _resultArray.count_
- Fix _resultArray_ when is not _Query_ `SELECT`.
- Added _format_ `id` to get _insertId_ when _Query_ `INSERT`.
