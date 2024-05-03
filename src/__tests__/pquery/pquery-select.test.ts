import { Ofn } from 'oro-functions';

import { OMysql } from '../../';
import { CONFIG_DEFAULT, DATABASE_NAME } from '../_config.mocks';

//

const TABLE_NAME_EASY = 'test_peasy_ts';
const UNIQUE_NAME_EASY = 'test_peasy_name_ts';

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
  test('default pquery SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROMM ${TABLE_NAME_EASY}`);
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(Ofn.type(result, true)).toBe('ResultArray');
    expect(result.status).toBe(false);
    expect(result.error?.type).toBe('wrong-query');
    expect(result.error?.msg).toMatch(/(Error: You have an error in your SQL syntax;)/);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('default pquery SELECT ok', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT *
                                        FROM ${TABLE_NAME_EASY}`);
    await oMysql.poolClose();

    expect(Ofn.type(result, true)).toBe('ResultArray');
    expect(result.status).toBe(true);
    expect(result.count).toBe(4);
  });
});

describe('bool pquery SELECT', () => {
  test('bool pquery SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT '' FROMM ${TABLE_NAME_EASY}`, 'bool');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(false);
    expect(lastQuery.count).toBe(null);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('bool pquery SELECT ok', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT '' FROM ${TABLE_NAME_EASY}`, 'bool');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(true);
    expect(lastQuery.status).toBe(true);
  });

  test('fnSanitize pquery SELECT ok get bool', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT '' FROM ${TABLE_NAME_EASY}`, 'bool', undefined, undefined, (value) => ({
      isDone: value,
    }));
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ isDone: true });
    expect(lastQuery.status).toBe(true);
  });
});

describe('count pquery SELECT', () => {
  test('count pquery SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT '' FROMM ${TABLE_NAME_EASY}`, 'count');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(false);
    expect(lastQuery.count).toBe(null);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('count pquery SELECT ok', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT '' FROM ${TABLE_NAME_EASY}`, 'count');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(4);
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('fnSanitize pquery SELECT ok get count', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(
      `SELECT '' FROM ${TABLE_NAME_EASY}`,
      'count',
      undefined,
      undefined,
      (value) => ({ total: value }),
    );
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ total: 4 });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });
});

describe('value pquery SELECT', () => {
  test('value pquery SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROMM ${TABLE_NAME_EASY} WHERE name = 'chacho'`, 'value');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(false);
    expect(lastQuery.count).toBe(null);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('value pquery SELECT ok get first', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY} WHERE name = 'chacho'`, 'value');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(1);
    expect(lastQuery.count).toBe(1);
    expect(lastQuery.status).toBe(true);
  });

  test('value pquery SELECT ok get value', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT name FROM ${TABLE_NAME_EASY} WHERE id = 1`, 'value');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe('chacho');
    expect(lastQuery.count).toBe(1);
    expect(lastQuery.status).toBe(true);
  });

  test('value pquery SELECT ok get column', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY} WHERE id = 1`, 'value', 'name');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe('chacho');
    expect(lastQuery.count).toBe(1);
    expect(lastQuery.status).toBe(true);
  });

  test('value pquery SELECT ok get bad column', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY} WHERE id = 1`, 'value', 'chacho');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(undefined);
    expect(lastQuery.count).toBe(1);
    expect(lastQuery.status).toBe(true);
  });

  test('fnSanitize pquery SELECT ok get value', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(
      `SELECT * FROM ${TABLE_NAME_EASY} WHERE name = 'chacho'`,
      'value',
      'name',
      undefined,
      (value) => ({ value }),
    );
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ value: 'chacho' });
    expect(lastQuery.count).toBe(1);
    expect(lastQuery.status).toBe(true);
  });
});

describe('values pquery SELECT', () => {
  test('values pquery SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROMM ${TABLE_NAME_EASY} ORDER BY id ASC`, 'values');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual(false);
    expect(lastQuery.count).toBe(null);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('values pquery SELECT ok get first', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, 'values');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual([1, 2, 3, 5]);
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('values pquery SELECT ok get column', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, 'values', 'name');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual(['chacho', 'bar', 'tio', '']);
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('values pquery SELECT ok get bad column', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, 'values', 'chacho');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual([undefined, undefined, undefined, undefined]);
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('fnSanitize pquery SELECT ok get values', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(
      `SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`,
      'values',
      'name',
      undefined,
      (value) => (value ? `name: ${value}` : undefined),
    );
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual(['name: chacho', 'name: bar', 'name: tio', undefined]);
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });
});

describe('valuesById pquery SELECT', () => {
  test('valuesById pquery SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROMM ${TABLE_NAME_EASY}`, 'valuesById', 'name');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual(false);
    expect(lastQuery.count).toBe(null);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('valuesById pquery SELECT ok get default', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY}`, 'valuesById', 'name');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ 1: 'chacho', 2: 'bar', 3: 'tio', 5: '' });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('valuesByIdpquery SELECT ok get column key', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY}`, 'valuesById', 'id', 'name');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ chacho: 1, bar: 2, tio: 3, '': 5 });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('valuesById pquery SELECT ok get bad column key', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY}`, 'valuesById', 'chacho', 'name');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ chacho: undefined, bar: undefined, tio: undefined, '': undefined });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('valuesById pquery SELECT ok get column bad key', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY}`, 'valuesById', 'id', 'chacho');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({});
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('fnSanitize pquery SELECT ok get valuesById column key', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY}`, 'valuesById', 'id', 'name', (value) => ({
      userId: value,
    }));
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({
      chacho: { userId: 1 },
      bar: { userId: 2 },
      tio: { userId: 3 },
      '': { userId: 5 },
    });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });
});

describe('array pquery SELECT', () => {
  test('array pquery SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROMM ${TABLE_NAME_EASY} ORDER BY id ASC`, 'array');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual(false);
    expect(lastQuery.count).toBe(null);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('array pquery SELECT ok', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, 'array');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual([
      { id: 1, name: 'chacho' },
      { id: 2, name: 'bar' },
      { id: 3, name: 'tio' },
      { id: 5, name: '' },
    ]);
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('fnSanitize pquery SELECT ok get array', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(
      `SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`,
      'array',
      undefined,
      undefined,
      (value, key) => (key === 'name' && value.length === 0 ? 'default' : value),
    );
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual([
      { id: 1, name: 'chacho' },
      { id: 2, name: 'bar' },
      { id: 3, name: 'tio' },
      { id: 5, name: 'default' },
    ]);
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });
});

describe('arrayById pquery SELECT', () => {
  test('arrayById pquery SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROMM ${TABLE_NAME_EASY} ORDER BY id ASC`, 'arrayById');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual(false);
    expect(lastQuery.count).toBe(null);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('arrayById pquery SELECT ok get default', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, 'arrayById');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({
      1: { id: 1, name: 'chacho' },
      2: { id: 2, name: 'bar' },
      3: { id: 3, name: 'tio' },
      5: { id: 5, name: '' },
    });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('arrayById pquery SELECT ok get column', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, 'arrayById', 'name');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({
      bar: { id: 2, name: 'bar' },
      chacho: { id: 1, name: 'chacho' },
      tio: { id: 3, name: 'tio' },
      '': { id: 5, name: '' },
    });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('arrayById pquery SELECT ok get bad column', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, 'arrayById', 'chacho');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({});
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('fnSanitize pquery SELECT ok get arrayById column', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(
      `SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`,
      'arrayById',
      'name',
      undefined,
      (value, key) => (key === 'name' && value.length === 0 ? 'default' : value),
    );
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({
      chacho: { id: 1, name: 'chacho' },
      bar: { id: 2, name: 'bar' },
      tio: { id: 3, name: 'tio' },
      default: { id: 5, name: 'default' },
    });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });
});

describe('row pquery SELECT', () => {
  test('row pquery SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROMM ${TABLE_NAME_EASY} ORDER BY id ASC`, 'row');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual(false);
    expect(lastQuery.count).toBe(null);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('row pquery SELECT ok get', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, 'row');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ id: 1, name: 'chacho' });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('row pquery SELECT ok get 2', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, 'row', 2);
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ id: 3, name: 'tio' });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('row pquery SELECT ok get bad 999', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, 'row', 999);
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual(undefined);
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('fnSanitize pquery SELECT ok get row', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(
      `SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`,
      'row',
      0,
      undefined,
      (value) => (value ? `user-${value}` : value),
    );
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ id: 'user-1', name: 'user-chacho' });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });
});

describe('rowStrict pquery SELECT', () => {
  test('rowStrict pquery SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.pquery(`SELECT * FROMM ${TABLE_NAME_EASY} WHERE id = 5`, 'rowStrict');
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual(false);
    expect(lastQuery.count).toBe(null);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('rowStrict pquery SELECT ok', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result1 = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY} WHERE id = 5`, 'row');
    const result2 = await oMysql.pquery(`SELECT * FROM ${TABLE_NAME_EASY} WHERE id = 5`, 'rowStrict');
    await oMysql.poolClose();

    expect(result1).toEqual({ id: 5, name: '' });
    expect(result2).toEqual({ id: 5 });
  });

  test('rowStrict pquery SELECT ok get fnSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result2 = await oMysql.pquery(
      `SELECT * FROM ${TABLE_NAME_EASY} WHERE id = 5`,
      'rowStrict',
      0,
      undefined,
      (value, key) => (key === 'id' ? `user-${value}` : value),
    );
    await oMysql.poolClose();

    expect(result2).toEqual({ id: 'user-5' });
  });
});
