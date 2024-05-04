import { OMysql } from '../../';
import { CONFIG_DEFAULT, DATABASE_NAME } from '../_config.mocks';

//

const TABLE_NAME_ONCE = 'test_ponce_ts';

beforeAll(async () => {
  const oMysql = new OMysql(CONFIG_DEFAULT);
  await oMysql.poolOpen();
  await oMysql.pquery(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`);
  await oMysql.pquery(`USE ${DATABASE_NAME}`);
  await oMysql.pquery(
    `CREATE TABLE IF NOT EXISTS ${TABLE_NAME_ONCE} ( \
        id INT NOT NULL AUTO_INCREMENT, \
        name VARCHAR (16) NOT NULL, \
    PRIMARY KEY ( id ), UNIQUE ${TABLE_NAME_ONCE}_name ( name ) ) ENGINE = InnoDB;`,
  );
  await oMysql.pquery(`INSERT INTO ${TABLE_NAME_ONCE} ( name ) VALUES ( 'chacho' )`);
  await oMysql.poolClose();
});

afterAll(async () => {
  const oMysql = new OMysql(CONFIG_DEFAULT);
  await oMysql.poolOpen();
  await oMysql.pquery(`USE ${DATABASE_NAME}`);
  await oMysql.pquery(`DROP TABLE IF EXISTS ${TABLE_NAME_ONCE}`);
  await oMysql.poolClose();
});

describe('queryOnce SELECT', () => {
  test('queryOnce SELECT bad settings', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: `${DATABASE_NAME}_wrong` });

    const response = await oMysql.pqueryOnce(`SELECT * FROM ${TABLE_NAME_ONCE}`, 'row');

    expect(response.status).toBe(false);
    if (response.status) {
      return;
    }

    expect(response.error.msg).toBe(`Error: Unknown database '${DATABASE_NAME}_wrong'`);
  });

  test('queryOnce SELECT bad query', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    const response = await oMysql.pqueryOnce(`SELECT * FROMM ${TABLE_NAME_ONCE}`, 'row');

    expect(response.status).toBe(false);
    if (response.status) {
      return;
    }

    expect(response.error.msg).toMatch(/(Error: You have an error in your SQL syntax;)/);
  });

  test('queryOnce SELECT query', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    const response = await oMysql.pqueryOnce(`SELECT * FROM ${TABLE_NAME_ONCE}`, 'row');

    expect(response.status).toBe(true);
    if (!response.status) {
      return;
    }

    expect(response.result).toEqual({ id: 1, name: 'chacho' });
  });
});
