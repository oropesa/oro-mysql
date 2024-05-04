const { OMysql } = require('../../');
const { CONFIG_DEFAULT, DATABASE_NAME } = require('../_config.mocks');

//

const TABLE_NAME_EASY = 'test_peasy_js';
const UNIQUE_NAME_EASY = 'test_peasy_name_js';

beforeAll(async () => {
  const oMysql = new OMysql(CONFIG_DEFAULT);
  await oMysql.poolOpen();
  await oMysql.pquery(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`);
  await oMysql.pquery(`USE ${DATABASE_NAME}`);
  await oMysql.pquery(
    `CREATE TABLE IF NOT EXISTS ${TABLE_NAME_EASY} ( \
        id INT NOT NULL AUTO_INCREMENT, \
        name VARCHAR (16) NOT NULL, \
    PRIMARY KEY ( id ), UNIQUE ${UNIQUE_NAME_EASY} ( name ) ) ENGINE = InnoDB;`,
  );
  await oMysql.pquery(`INSERT INTO ${TABLE_NAME_EASY} ( name ) VALUES ( 'chacho' ), ( 'bar' ), ( 'tio' )`);
  await oMysql.pquery(`INSERT INTO ${TABLE_NAME_EASY} ( id, name ) VALUES ( 5, '' )`);
  await oMysql.poolClose();
});

afterAll(async () => {
  const oMysql = new OMysql(CONFIG_DEFAULT);
  await oMysql.poolOpen();
  await oMysql.pquery(`USE ${DATABASE_NAME}`);
  await oMysql.pquery(`DROP TABLE IF EXISTS ${TABLE_NAME_EASY}`);
  await oMysql.poolClose();
});

//

describe('default pquery SELECT', () => {
  test('pquery SELECT ok get bad format', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY}`, 'chacho');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(false);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.msg).toBe('OMysql.query:format is not allowed: chacho');
  });

  test('pquery SELECT ok bad fnSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    await oMysql.pquery(`SELECT '' FROM ${TABLE_NAME_EASY}`, 'array', undefined, undefined, 'chacho');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.msg).toBe('OMysql.query:fnValueSanitize must be a function, not a string.');
  });
});
