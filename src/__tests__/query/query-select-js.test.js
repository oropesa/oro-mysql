import { Ofn } from 'oro-functions';

import { OMysql } from '../../';
import { CONFIG_DEFAULT, DATABASE_NAME } from '../_config.mocks';

//

const TABLE_NAME_EASY = 'test_easy_js';
const UNIQUE_NAME_EASY = 'test_easy_name_js';

beforeAll(async () => {
  const oMysql = new OMysql(CONFIG_DEFAULT);
  await oMysql.poolOpen();
  await oMysql.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`);
  await oMysql.query(`USE ${DATABASE_NAME}`);
  await oMysql.query(
    `CREATE TABLE IF NOT EXISTS ${TABLE_NAME_EASY} ( \
        id INT NOT NULL AUTO_INCREMENT, \
        name VARCHAR (16) NOT NULL, \
    PRIMARY KEY ( id ), UNIQUE ${UNIQUE_NAME_EASY} ( name ) ) ENGINE = InnoDB;`,
  );
  await oMysql.query(`INSERT INTO ${TABLE_NAME_EASY} ( name ) VALUES ( 'chacho' ), ( 'bar' ), ( 'tio' )`);
  await oMysql.query(`INSERT INTO ${TABLE_NAME_EASY} ( id, name ) VALUES ( 5, '' )`);
  await oMysql.poolClose();
});

afterAll(async () => {
  const oMysql = new OMysql(CONFIG_DEFAULT);
  await oMysql.poolOpen();
  await oMysql.query(`USE ${DATABASE_NAME}`);
  await oMysql.query(`DROP TABLE IF EXISTS ${TABLE_NAME_EASY}`);
  await oMysql.poolClose();
});

//

describe('default query SELECT', () => {
  test('query SELECT ok get bad format', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY}`, { format: 'chacho' });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(false);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.msg).toBe('OMysql.query:format is not allowed: chacho');
  });

  test('query SELECT ok bad fnSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT '' FROM ${TABLE_NAME_EASY}`, {
      format: 'default',
      fnSanitize: 'chacho',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(Ofn.type(result, true)).toBe('ResultArray');
    expect(result.status).toBe(false);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.msg).toBe('OMysql.query:fnSanitize must be a function, not a string.');
  });
});

describe('valuesById query SELECT', () => {
  test('valuesById query SELECT ok get column wrong key', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY}`, {
      format: 'valuesById',
      valueKey: 'name',
      valueId: true,
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ 1: 'chacho', 2: 'bar', 3: 'tio', 5: '' });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });
});
