## 2.1.6 / 2025-10-22

- Add `update-deps.js` script.
- Update _github-workflows_ with `actions/checkout@v5` and `node-version: 22`.
- Update libs:
  - `mysql2` from `v3.13.0` to `v3.15.3`.
  - `oro-functions-client` from `v2.3.5` to `v2.3.6`.
- Update _dev_ libs:
  - `@babel/core` from `v7.26.9` to `v7.28.4`.
  - `@babel/preset-env` from `v7.26.9` to `v7.28.3`.
  - `@babel/preset-typescript` from `v7.26.0` to `v7.27.1`.
  - `@eslint/js` from `v9.22.0` to `v9.38.0`.
  - `@types/jest` from `v29.5.14` to `v30.0.0`.
  - `babel-jest` from `v29.7.0` to `v30.2.0`.
  - `eslint` from `v9.22.0` to `v9.38.0`.
  - `eslint-config-prettier` from `v10.1.1` to `v10.1.8`.
  - `eslint-plugin-jest` from `v28.11.0` to `v29.0.1`.
  - `eslint-plugin-prettier` from `v5.2.3` to `v5.5.4`.
  - `eslint-plugin-unicorn` from `v57.0.0` to `v61.0.2`.
  - `globals` from `v16.0.0` to `v16.4.0`.
  - `jest` from `v29.7.0` to `v30.2.0`.
  - `nodemon` from `v3.1.9` to `v3.1.10`.
  - `oro-functions` from `v2.4.3` to `v2.4.4`.
  - `oro-timer` from `v2.2.4` to `v2.2.5`.
  - `prettier` from `v3.5.3` to `v3.6.2`.
  - `tsup` from `v8.4.0` to `v8.5.0`.
  - `typescript` from `v5.8.2` to `v5.9.3`.
  - `typescript-eslint` from `v8.26.0` to `v8.46.2`.

## 2.1.5 / 2025-03-09

- Reset `package-lock.json`.
- Enhance `tsconfig.json`.
- Enhance _package_ `clean` and `build` scripts.
- Update libs:
  - `mysql2` from `v3.12.0` to `v3.13.0`.
  - `oro-functions-client` from `v2.3.4` to `v2.3.5`.
- Update _dev_ libs:
  - `@babel/core` from `v7.26.0` to `v7.26.9`.
  - `@babel/preset-env` from `v7.26.0` to `v7.26.9`.
  - `@eslint/js` from `v9.17.0` to `v9.22.0`.
  - `@trivago/prettier-plugin-sort-imports` from `v5.2.0` to `v5.2.2`.
  - `eslint` from `v9.17.0` to `v9.22.0`.
  - `eslint-config-prettier` from `v9.1.0` to `v10.1.1`.
  - `eslint-plugin-jest` from `v28.10.0` to `v28.11.0`.
  - `eslint-plugin-prettier` from `v5.2.1` to `v5.2.3`.
  - `eslint-plugin-unicorn` from `v56.0.1` to `v57.0.0`.
  - `globals` from `v15.14.0` to `v16.0.0`.
  - `oro-functions` from `v3.4.2` to `v3.5.3`.
  - `oro-timer` from `v2.3.4` to `v2.4.3`.
  - `prettier` from `v2.2.3` to `v2.2.4`.
  - `tsup` from `v8.3.5` to `v8.4.0`.
  - `typescript` from `v5.7.2` to `v5.8.2`.
  - `typescript-eslint` from `v8.18.2` to `v8.26.0`.

## 2.1.4 / 2024-12-28
- Improve `eslint.config.js`.
- Update libs:
  - `mysql2` from `v3.11.3` to `v3.12.0`.
  - `oro-functions` from `v2.3.2` to `v2.3.4`.
- Added _dev_ libs:
  - `eslint-plugin-jest-dom` added `v5.5.0`.
  - `eslint-plugin-prettier` added `v5.2.1`.
- Update _dev_ libs:
  - `@babel/core` from `v7.25.2` to `v7.26.0`.
  - `@babel/preset-env` from `v7.25.4` to `v7.26.0`.
  - `@babel/preset-typescript` from `v7.24.7` to `v7.26.0`.
  - `@eslint/js` from `v9.11.1` to `v9.17.0`.
  - `@trivago/prettier-plugin-sort-imports` from `v4.3.0` to `v5.2.0`.
  - `@types/jest` from `v29.5.13` to `v29.5.14`.
  - `eslint` from `v9.11.1` to `v9.17.0`.
  - `eslint-plugin-jest` from `v28.8.3` to `v28.10.0`.
  - `eslint-plugin-unicorn` from `v55.0.0` to `v56.0.1`.
  - `globals` from `v15.9.0` to `v15.14.0`.
  - `husky` from `v9.1.6` to `v9.1.7`.
  - `nodemon` from `v3.1.7` to `v3.1.9`.
  - `oro-functions` from `v2.3.2` to `v2.3.4`.
  - `oro-timer` from `v2.2.1` to `v2.2.3`.
  - `prettier` from `v3.3.3` to `v3.4.2`.
  - `tsup` from `v8.3.0` to `v8.3.5`.
  - `typescript` from `v5.5.4` to `v5.7.2`.
  - `typescript-eslint` from `v8.7.0` to `v8.18.2`.

## 2.1.3 / 2024-09-24

- Apply `prettier --write` in the whole project (with `endOfLine: 'lf'`).
- Fix eslint `@typescript-eslint/no-unused-expressions` rule in code.
- Update `eslint` _breakpoint version_ (v8 to v9).
- Update typescript _target_ to `ES2020`.
- Updated libs:
  - `mysql2` from `v3.10.2` to `v3.11.3`.
  - `oro-functions-client` from `v2.3.1` to `v2.3.2`.
- Updated _dev_ libs:
  - `@babel/core` from `v7.24.9` to `v7.25.2`.
  - `@babel/preset-env` from `v7.24.8` to `v7.25.4`.
  - `@eslint/js` from `v9.7.0` to `v9.11.1`.
  - `@types/jest` from `v29.5.12` to `v29.5.13`.
  - `eslint` from `v8.57.0` to `v9.11.1`.
  - `eslint-plugin-jest` from `v28.6.0` to `v28.8.3`.
  - `eslint-plugin-unicorn` from `v54.0.0` to `v55.0.0`.
  - `globals` from `v15.8.0` to `v15.9.0`.
  - `husky` from `v9.0.11` to `v9.1.6`.
  - `nodemon` from `v3.1.4` to `v3.1.7`.
  - `oro-functions` from `v2.3.1` to `v2.3.2`.
  - `oro-timer` from `v2.1.1` to `v2.2.1`.
  - `tsup` from `v8.1.0` to `v8.3.0`.
  - `typescript` from `v5.5.3` to `v5.5.4`.
  - `typescript-eslint` from `v7.16.0` to `v8.7.0`.

## 2.1.2 / 2024-07-16

- Fixed `README.md` removing the _sql-injection_ example, which caused the package doesn't `npm publish`.

## 2.1.1 / 2024-07-15

- Fixed package `exports`.

## 2.1.0 / 2024-07-15

- Updated _eslint_ to flat `eslint.config.js`.
- Simplified `tsup.config.ts`.
- Updated libs:
  - `mysql2` from `v3.9.` to `v3.10.2`.
  - `oro-functions-client` from `v2.2.2` to `v2.3.1`.
- Updated _dev_ libs:
  - `@babel/core` from `v7.24.5` to `v7.24.9`.
  - `@babel/preset-env` from `v7.24.5` to `v7.24.8`.
  - `@babel/preset-typescript` from `v7.24.1` to `v7.24.7`.
  - `eslint-plugin-jest` from `v28.4.0` to `v28.6.0`.
  - `eslint-plugin-unicorn` from `v52.0.0` to `v54.0.0`.
  - `nodemon` from `v3.1.0` to `v3.1.4`.
  - `oro-functions` from `v2.1.1` to `v2.3.1`.
  - `oro-timer` from `v2.0.6` to `v2.1.1`.
  - `prettier` from `v3.2.5` to `v3.3.3`.
  - `tsup` from `v8.0.2` to `v8.1.0`.
  - `typescript` from `v5.4.5` to `v5.5.3`.
- Added _dev_ libs:
  - `@eslint/js` added `v9.7.0`.
  - `globals` added `v15.8.0`.
  - `typescript-eslint` added `v7.16.0`.
- Removed _dev_ libs:
  - `@typescript-eslint/eslint-plugin` removed.
  - `@typescript-eslint/parser` removed.
  - `eslint-config-alloy` removed.
  - `eslint-plugin-github` removed.
  - `eslint-plugin-jest-formatting` removed.

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
