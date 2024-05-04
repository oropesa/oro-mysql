import { Ofn } from 'oro-functions';

import { OMysql } from '../../';
import { CONFIG_DEFAULT, DATABASE_NAME } from '../_config.mocks';

//

const TABLE_NAME_EASY = 'test_update_easy_ts';
const UNIQUE_NAME_EASY = 'test_update_easy_name_ts';

beforeAll(async () => {
  const oMysql = new OMysql(CONFIG_DEFAULT);
  await oMysql.poolOpen();
  await oMysql.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`);
  await oMysql.query(`USE ${DATABASE_NAME}`);
  await oMysql.query(
    `CREATE TABLE IF NOT EXISTS ${TABLE_NAME_EASY} ( \
        id INT NOT NULL AUTO_INCREMENT, \
        name VARCHAR (16) NOT NULL, \
    PRIMARY KEY ( id ), UNIQUE ${UNIQUE_NAME_EASY} ( name ) ) ENGINE=InnoDB;`,
  );
  await oMysql.query(`INSERT INTO ${TABLE_NAME_EASY} ( name ) VALUES ( 'chacho' ), ( 'loco' ), ( 'tio' )`);
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

describe('query UPDATE', () => {
  test('query UPDATE ok', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`UPDATE ${TABLE_NAME_EASY} SET name = 'foo' WHERE id = 2`);
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(Ofn.type(result, true)).toBe('ResultArray');
    expect(lastQuery.count).toBe(1);
    expect(lastQuery.status).toBe(true);
  });

  test('query UPDATE ok get bool false', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`UPDATE ${TABLE_NAME_EASY} SET name = 'bar' WHERE name = 'fooo'`, {
      format: 'bool',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(false);
    expect(lastQuery.count).toBe(0);
    expect(lastQuery.status).toBe(true);
  });

  test('query UPDATE ok get bool true', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`UPDATE ${TABLE_NAME_EASY} SET name = 'bar' WHERE name = 'foo'`, {
      format: 'bool',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(true);
    expect(lastQuery.count).toBe(1);
    expect(lastQuery.status).toBe(true);
  });
});
