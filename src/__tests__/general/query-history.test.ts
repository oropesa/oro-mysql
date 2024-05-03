import { Ofn } from 'oro-functions-client';

import { OMysql } from '../../';
import type { ResultArray } from '../../';
import { CONFIG_DEFAULT, DATABASE_NAME } from '../_config.mocks';

// NOTE:
//  - getAffectedRows
//  - getLastQuery
//  - getFirstQuery
//  - getAllQueries
//  - clearQueries

//

const TABLE_NAME = 'test_tools_ts';

beforeAll(async () => {
  const oMysql = new OMysql(CONFIG_DEFAULT);
  await oMysql.poolOpen();
  await oMysql.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`);
  await oMysql.query(`USE ${DATABASE_NAME}`);
  await oMysql.query(
    `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} ( \
        id INT NOT NULL AUTO_INCREMENT, \
        name VARCHAR (16) NOT NULL, \
        info TEXT NOT NULL, \
        enabled TINYINT(1) NOT NULL DEFAULT 0, \
        fecha DATE NULL, \
        created DATETIME NULL DEFAULT CURRENT_TIMESTAMP, \
    PRIMARY KEY ( id ), UNIQUE test_easy_name ( name ) ) ENGINE = InnoDB;`,
  );
  await oMysql.poolClose();
});

afterAll(async () => {
  const oMysql = new OMysql(CONFIG_DEFAULT);
  await oMysql.poolOpen();
  await oMysql.query(`USE ${DATABASE_NAME}`);
  await oMysql.query(`DROP TABLE IF EXISTS ${TABLE_NAME}`);
  await oMysql.poolClose();
});

//

describe('tools query history', () => {
  test('tool getAffectedRows', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    const query = `INSERT INTO ${TABLE_NAME} ( name, info, enabled, fecha) \
         VALUES ( 'chacho', 'loco', '1', '2022-05-01' ), \
                ( 'foo', 'bar', '0', NULL )`;

    await oMysql.poolOpen();
    const result = await oMysql.query(query);
    await oMysql.poolClose();

    expect(result.statement).toBe(query);
    expect(result.status).toBe(true);
    expect(result.count).toBe(2);
    expect(oMysql.getAffectedRows()).toBe(2);
  });

  test('tool getLastQuery', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 1`);
    const result2 = await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 2`);
    await oMysql.poolClose();

    // deep copy object
    const lastResult = oMysql.getLastQuery();

    expect(Ofn.type(lastResult, true)).toBe('ResultArray');
    expect(result2).not.toBe(lastResult);
    expect(result2).toEqual(lastResult);
  });

  test('tool getLastQuery offset', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result1 = await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 1`);
    await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 2`);
    await oMysql.poolClose();

    // deep copy object
    const lastResult = oMysql.getLastQuery(1);

    expect(Ofn.type(lastResult, true)).toBe('ResultArray');
    expect(result1).not.toBe(lastResult);
    expect(result1).toEqual(lastResult);
  });

  test('tool getLastQuery raw', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 1`);
    const result2 = await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 2`);
    await oMysql.poolClose();

    // raw object
    const lastResult = oMysql.getLastQuery(0, true);

    expect(Ofn.type(lastResult, true)).toBe('ResultArray');
    expect(result2).toBe(lastResult);
  });

  test('tool getLastQuery offset bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 1`);
    await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 2`);
    await oMysql.poolClose();

    const lastResult = oMysql.getLastQuery(2);

    expect(lastResult).toBe(undefined);
  });

  test('tool getFirstQuery', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result1 = await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 1`);
    await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 2`);
    await oMysql.poolClose();

    // deep copy object
    const lastResult = oMysql.getFirstQuery();

    expect(Ofn.type(lastResult, true)).toBe('ResultArray');
    expect(result1).not.toBe(lastResult);
    expect(result1).toEqual(lastResult);
  });

  test('tool getFirstQuery offset', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 1`);
    const result2 = await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 2`);
    await oMysql.poolClose();

    // deep copy object
    const lastResult = oMysql.getFirstQuery(1);

    expect(Ofn.type(lastResult, true)).toBe('ResultArray');
    expect(result2).not.toBe(lastResult);
    expect(result2).toEqual(lastResult);
  });

  test('tool getFirstQuery raw', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result1 = await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 1`);
    await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 2`);
    await oMysql.poolClose();

    // raw object
    const lastResult = oMysql.getFirstQuery(0, true);

    expect(Ofn.type(lastResult, true)).toBe('ResultArray');
    expect(result1).toBe(lastResult);
  });

  test('tool getFirstQuery offset bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 1`);
    await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 2`);
    await oMysql.poolClose();

    const lastResult = oMysql.getFirstQuery(2);

    expect(lastResult).toBe(undefined);
  });

  test('tool getAllQueries', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    const results: ResultArray[] = [];

    await oMysql.poolOpen();
    results.push(
      await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 1`),
      await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 2`),
    );
    await oMysql.poolClose();

    // deep copy objects
    const allResults = oMysql.getAllQueries();

    for (let index = 0, length = results.length; index < length; index++) {
      expect(results[index]).not.toBe(allResults[index]);
      expect(results[index]).toEqual(allResults[index]);
    }
  });

  test('tool getAllQueries exactly', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    const results: ResultArray[] = [];

    await oMysql.poolOpen();
    results.push(
      await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 1`),
      await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 2`),
    );
    await oMysql.poolClose();

    // raw objects
    const allResults = oMysql.getAllQueries(true);

    for (let index = 0, length = results.length; index < length; index++) {
      expect(results[index]).toBe(allResults[index]);
    }
  });

  test('tool clearQueries', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    const results: ResultArray[] = [];

    await oMysql.poolOpen();
    results.push(
      await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 1`),
      await oMysql.query(`SELECT * FROM ${TABLE_NAME} WHERE id = 2`),
    );
    await oMysql.poolClose();

    const allResults = oMysql.getAllQueries(true);
    oMysql.clearQueries();
    const newResults = oMysql.getAllQueries(true);

    expect(results.length).toBe(2);
    expect(allResults.length).toBe(2);
    expect(newResults.length).toBe(0);
  });
});
