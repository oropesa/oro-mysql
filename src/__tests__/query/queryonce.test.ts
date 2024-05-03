import { OMysql } from '../../';
import { CONFIG_DEFAULT, DATABASE_NAME } from '../_config.mocks';

//

const TABLE_NAME_ONCE = 'test_once_ts';

beforeAll(async () => {
  const oMysql = new OMysql(CONFIG_DEFAULT);
  await oMysql.poolOpen();
  await oMysql.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`);
  await oMysql.query(`USE ${DATABASE_NAME}`);
  await oMysql.query(
    `CREATE TABLE IF NOT EXISTS ${TABLE_NAME_ONCE} ( \
        id INT NOT NULL AUTO_INCREMENT, \
        name VARCHAR (16) NOT NULL, \
    PRIMARY KEY ( id ), UNIQUE ${TABLE_NAME_ONCE}_name ( name ) ) ENGINE = InnoDB;`,
  );
  await oMysql.query(`INSERT INTO ${TABLE_NAME_ONCE} ( name ) VALUES ( 'chacho' )`);
  await oMysql.poolClose();
});

afterAll(async () => {
  const oMysql = new OMysql(CONFIG_DEFAULT);
  await oMysql.poolOpen();
  await oMysql.query(`USE ${DATABASE_NAME}`);
  await oMysql.query(`DROP TABLE IF EXISTS ${TABLE_NAME_ONCE}`);
  await oMysql.poolClose();
});

describe('queryOnce SELECT', () => {
  test('queryOnce SELECT bad settings', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: `${DATABASE_NAME}_wrong` });

    const response = await oMysql.queryOnce(`SELECT * FROM ${TABLE_NAME_ONCE}`, { format: 'row' });

    expect(response.status).toBe(false);
    if (response.status) {
      return;
    }

    expect(response.error.msg).toBe(`Error: Unknown database '${DATABASE_NAME}_wrong'`);
  });

  test('queryOnce SELECT bad query', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    const response = await oMysql.queryOnce(`SELECT * FROMM ${TABLE_NAME_ONCE}`, { format: 'row' });

    expect(response.status).toBe(false);
    if (response.status) {
      return;
    }

    expect(response.error.msg).toMatch(/(Error: You have an error in your SQL syntax;)/);
  });

  test('queryOnce SELECT query', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    const response = await oMysql.queryOnce(`SELECT * FROM ${TABLE_NAME_ONCE}`, { format: 'row' });

    expect(response.status).toBe(true);
    if (!response.status) {
      return;
    }

    expect(response.result).toEqual({ id: 1, name: 'chacho' });
  });
});
