## 1.0.1 / 2022-05-31
* Fixed removing a forgotten console.log in `query, id`.
* Added testing of `query, fnSanitize`.

## 1.0.0 / 2022-05-31
* Added `MIT License`.
* Added _unit testing_ `Jest`.
* Added _package_ in `github.com` & `npmjs.com`.
* Added _fns_ `getFirstQuery`, `queryOnce`, improve security and performance.
* Updated lib `mysql2` to `v2.3.3`.
* Updated lib `oro-functions` to `v1.1.5`.

## 0.1.4 / 2021-11-16
* Update `oro-functions` to `1.0.1`.

## 0.1.3 / 2021-05-21
* Fixed method `query` when _format_ `valuesById` is numeric.

## 0.1.2 / 2021-04-05
* Fix data when *fnSanitize* is called in methods `array`, `arrayById`, `rowStrict`, `row`.

## 0.1.1 / 2021-04-05
* Add method `sanitize` to avoid SQL injections.

## 0.0.3 / 2021-04-05
* Add `args.oTimer` in methods `.poolOpen()` and `.poolClose()` to use it automatically.
* Cast *raw* `resultArray` to *object* by default in methods `.getLastQuery()` and `.getAllQueries()`.

## 0.0.2 / 2021-03-29
* Added changelog.
* Fix *resultArray.count*
* Fix *resultArray* when is not *Query* `SELECT`. 
* Added *format* `id` to get *insertId* when *Query* `INSERT`. 
