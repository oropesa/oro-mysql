import { Ofn } from 'oro-functions';

import { OMysql } from '../../';
import { CONFIG_DEFAULT, DATABASE_NAME } from '../_config.mocks';

//

const TABLE_NAME_EASY = 'test_pinsert_easy_ts';
const UNIQUE_NAME_EASY = 'test_pinsert_easy_ts_name';

const TABLE_NAME_CODE = 'test_pinsert_code_ts';
const TABLE_NAME_LABEL = 'test_pinsert_label_ts';

beforeAll(async () => {
  const oMysql = new OMysql(CONFIG_DEFAULT);
  await oMysql.poolOpen();
  await oMysql.pquery(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`);
  await oMysql.pquery(`USE ${DATABASE_NAME}`);
  await oMysql.pquery(
    `CREATE TABLE IF NOT EXISTS ${TABLE_NAME_EASY} ( \
        id INT NOT NULL AUTO_INCREMENT, \
        name VARCHAR (16) NOT NULL, \
    PRIMARY KEY ( id ), UNIQUE ${UNIQUE_NAME_EASY} ( name ) ) ENGINE=InnoDB;`,
  );
  await oMysql.pquery(
    `CREATE TABLE IF NOT EXISTS ${TABLE_NAME_CODE} ( \
        name VARCHAR (16) NOT NULL, \
        code INT NOT NULL AUTO_INCREMENT, \
    PRIMARY KEY ( code, name ) ) ENGINE=InnoDB AUTO_INCREMENT=7;`,
  );
  await oMysql.pquery(
    `CREATE TABLE IF NOT EXISTS ${TABLE_NAME_LABEL} ( \
      label VARCHAR (16) NOT NULL, \
      name VARCHAR (16) NOT NULL, \
    PRIMARY KEY ( label ) ) ENGINE=InnoDB;`,
  );
  await oMysql.poolClose();
});

afterAll(async () => {
  const oMysql = new OMysql(CONFIG_DEFAULT);
  await oMysql.poolOpen();
  await oMysql.pquery(`USE ${DATABASE_NAME}`);
  await oMysql.pquery(`DROP TABLE IF EXISTS ${TABLE_NAME_EASY}`);
  await oMysql.pquery(`DROP TABLE IF EXISTS ${TABLE_NAME_CODE}`);
  await oMysql.pquery(`DROP TABLE IF EXISTS ${TABLE_NAME_LABEL}`);
  await oMysql.poolClose();
});

interface CodeObject {
  name: string;
  code: number;
}
interface LabelObject {
  label: string;
  name: string;
}

//

describe('query when pool not opened', () => {
  test('query before poolOpen', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    const result = await oMysql.pquery(`INSERT INTO ${TABLE_NAME_EASY} ( name ) VALUES ( 'chacho' )`);

    expect(result.status).toBe(false);
    expect(result.error?.msg).toBe('Server is down');
  });

  test('query after poolClose', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    await oMysql.poolClose();

    const result = await oMysql.pquery(`INSERT INTO ${TABLE_NAME_EASY} ( name ) VALUES ( 'chacho' )`);

    expect(result.status).toBe(false);
    expect(result.error?.msg).toBe('Server is down');
  });
});

describe('easy query INSERT', () => {
  test('easy query INSERT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`INSERT INTO ${TABLE_NAME_EASY} ( namee ) VALUES ( 'chacho' )`);
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result.status).toBe(false);
    expect(result.error?.msg).toBe("Error: Unknown column 'namee' in 'field list'");
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.msg).toBe("Error: Unknown column 'namee' in 'field list'");
  });

  test('easy query INSERT ok bool', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`INSERT INTO ${TABLE_NAME_EASY} ( name ) VALUES ( 'chacho' )`, 'bool');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(true);
    expect(Ofn.type(lastQuery, true)).toBe('ResultArray');
    expect(lastQuery.count).toBe(1);
    expect(lastQuery.status).toBe(true);
  });

  test('easy query INSERT ok get id', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`INSERT INTO ${TABLE_NAME_EASY} ( name ) VALUES ( 'loco' )`, 'id');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(2);
    expect(lastQuery.count).toBe(1);
    expect(lastQuery.status).toBe(true);
  });

  test('easy query INSERT ko unique', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`INSERT INTO ${TABLE_NAME_EASY} ( name ) VALUES ( 'chacho' )`, 'id');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(false);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.msg).toMatch(/Error: Duplicate entry 'chacho' for key/);
  });

  test('easy query INSERT ok get bool', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`INSERT INTO ${TABLE_NAME_EASY} ( name ) VALUES ( 'tio' )`, 'bool');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(true);
    expect(lastQuery.count).toBe(1);
    expect(lastQuery.status).toBe(true);
  });

  test('fnSanitize query INSERT ok get id', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(
      `INSERT INTO ${TABLE_NAME_EASY} ( id, name ) VALUES ( 6, 'foo' )`,
      'id',
      undefined,
      undefined,
      (value) => ({ rowId: value }),
    );
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ rowId: 6 });
    expect(lastQuery.status).toBe(true);
  });
});

describe('code: query INSERT', () => {
  test('code query INSERT ok get id', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(
      `INSERT INTO ${TABLE_NAME_CODE} ( name ) VALUES ( 'chacho' ), ( 'loco' )`,
      'id',
    );
    const array = await oMysql.pquery<CodeObject>(`SELECT * FROM ${TABLE_NAME_CODE} ORDER BY code`, 'array');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery(1);

    expect(result).toBe(7);
    expect(array).toEqual([
      { name: 'chacho', code: 7 },
      { name: 'loco', code: 8 },
    ]);
    expect(lastQuery.count).toBe(2);
    expect(lastQuery.status).toBe(true);
  });

  test('code query INSERT ok get another id', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`INSERT INTO ${TABLE_NAME_CODE} ( name ) VALUES ( 'foo' ), ( 'bar' )`, 'id');
    const array = await oMysql.pquery<CodeObject>(`SELECT * FROM ${TABLE_NAME_CODE} ORDER BY code`, 'array');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery(1);

    expect(result).toBe(9);
    expect(array).toEqual([
      { name: 'chacho', code: 7 },
      { name: 'loco', code: 8 },
      { name: 'foo', code: 9 },
      { name: 'bar', code: 10 },
    ]);
    expect(lastQuery.count).toBe(2);
    expect(lastQuery.status).toBe(true);
  });
});

describe('label: query INSERT', () => {
  test('label query INSERT ok get id', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(
      `INSERT INTO ${TABLE_NAME_LABEL} ( label, name ) VALUES ( 'chacho', 'chacho' ), ( 'loco', 'loco' )`,
      'id',
    );
    const array = await oMysql.pquery<LabelObject>(`SELECT * FROM ${TABLE_NAME_LABEL} ORDER BY label`, 'array');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery(1);

    expect(result).toBe(0);
    expect(array).toEqual([
      { label: 'chacho', name: 'chacho' },
      { label: 'loco', name: 'loco' },
    ]);
    expect(lastQuery.count).toBe(2);
    expect(lastQuery.status).toBe(true);
  });

  test('label query INSERT ok get another id', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(
      `INSERT INTO ${TABLE_NAME_LABEL} ( label, name ) VALUES ( 'foo', 'foo' ), ( 'bar', 'bar' )`,
      'id',
    );
    const array = await oMysql.pquery<LabelObject>(`SELECT * FROM ${TABLE_NAME_LABEL} ORDER BY label`, 'array');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery(1);

    expect(result).toBe(0);
    expect(array).toEqual([
      { label: 'bar', name: 'bar' },
      { label: 'chacho', name: 'chacho' },
      { label: 'foo', name: 'foo' },
      { label: 'loco', name: 'loco' },
    ]);
    expect(lastQuery.count).toBe(2);
    expect(lastQuery.status).toBe(true);
  });
});
