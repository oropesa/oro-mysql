import { Ofn } from 'oro-functions';

import { OMysql } from '../../';
import { CONFIG_DEFAULT, DATABASE_NAME } from '../_config.mocks';

//

const TABLE_NAME_EASY = 'test_easy_ts';
const UNIQUE_NAME_EASY = 'test_easy_name_ts';

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
  test('default query SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROMM ${TABLE_NAME_EASY}`);
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(Ofn.type(result, true)).toBe('ResultArray');
    expect(result.status).toBe(false);
    expect(result.error?.type).toBe('wrong-query');
    expect(result.error?.msg).toMatch(/(Error: You have an error in your SQL syntax;)/);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('default query SELECT ok', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT *
                                        FROM ${TABLE_NAME_EASY}`);
    await oMysql.poolClose();

    expect(Ofn.type(result, true)).toBe('ResultArray');
    expect(result.status).toBe(true);
    expect(result.count).toBe(4);
  });
});

describe('bool query SELECT', () => {
  test('bool query SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT '' FROMM ${TABLE_NAME_EASY}`, { format: 'bool' });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(false);
    expect(lastQuery.count).toBe(null);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('bool query SELECT ok', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT '' FROM ${TABLE_NAME_EASY}`, { format: 'bool' });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(true);
    expect(lastQuery.status).toBe(true);
  });

  test('query SELECT ok get bool fnSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT '' FROM ${TABLE_NAME_EASY}`, {
      format: 'bool',
      fnSanitize: (value: boolean) => ({ isDone: value }),
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ isDone: true });
    expect(lastQuery.status).toBe(true);
  });
});

describe('count query SELECT', () => {
  test('count query SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT '' FROMM ${TABLE_NAME_EASY}`, { format: 'count' });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(false);
    expect(lastQuery.count).toBe(null);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('count query SELECT ok', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT '' FROM ${TABLE_NAME_EASY}`, { format: 'count' });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(4);
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('query SELECT ok get count fnSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT '' FROM ${TABLE_NAME_EASY}`, {
      format: 'count',
      fnSanitize: (value: number) => ({ total: value }),
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ total: 4 });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });
});

describe('value query SELECT', () => {
  test('value query SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROMM ${TABLE_NAME_EASY} WHERE name = 'chacho'`, {
      format: 'value',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(false);
    expect(lastQuery.count).toBe(null);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('value query SELECT ok get first', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} WHERE name = 'chacho'`, {
      format: 'value',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(1);
    expect(lastQuery.count).toBe(1);
    expect(lastQuery.status).toBe(true);
  });

  test('value query SELECT ok get value', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT name FROM ${TABLE_NAME_EASY} WHERE id = 1`, {
      format: 'value',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe('chacho');
    expect(lastQuery.count).toBe(1);
    expect(lastQuery.status).toBe(true);
  });

  test('value query SELECT ok get column', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} WHERE id = 1`, {
      format: 'value',
      valueKey: 'name',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe('chacho');
    expect(lastQuery.count).toBe(1);
    expect(lastQuery.status).toBe(true);
  });

  test('value query SELECT ok get bad column', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} WHERE id = 1`, {
      format: 'value',
      valueKey: 'chacho',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toBe(undefined);
    expect(lastQuery.count).toBe(1);
    expect(lastQuery.status).toBe(true);
  });

  test('query SELECT ok get value fnSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} WHERE name = 'chacho'`, {
      format: 'value',
      valueKey: 'name',
      fnSanitize: (value: string) => ({ value }),
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ value: 'chacho' });
    expect(lastQuery.count).toBe(1);
    expect(lastQuery.status).toBe(true);
  });
});

describe('values query SELECT', () => {
  test('values query SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROMM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'values',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual(false);
    expect(lastQuery.count).toBe(null);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('values query SELECT ok get first', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'values',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual([1, 2, 3, 5]);
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('values query SELECT ok get column', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'values',
      valueKey: 'name',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual(['chacho', 'bar', 'tio', '']);
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('values query SELECT ok get bad column', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'values',
      valueKey: 'chacho',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual([undefined, undefined, undefined, undefined]);
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('query SELECT ok get values fnSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'values',
      valueKey: 'name',
      fnSanitize: (value: string) => (value ? `name: ${value}` : undefined),
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual(['name: chacho', 'name: bar', 'name: tio', undefined]);
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });
});

describe('valuesById query SELECT', () => {
  test('valuesById query SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROMM ${TABLE_NAME_EASY}`, {
      format: 'valuesById',
      valueKey: 'name',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual(false);
    expect(lastQuery.count).toBe(null);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('valuesById query SELECT ok get default', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY}`, {
      format: 'valuesById',
      valueKey: 'name',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ 1: 'chacho', 2: 'bar', 3: 'tio', 5: '' });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('valuesByIdquery SELECT ok get column key', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY}`, {
      format: 'valuesById',
      valueKey: 'id',
      valueId: 'name',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ chacho: 1, bar: 2, tio: 3, '': 5 });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('valuesById query SELECT ok get bad column key', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY}`, {
      format: 'valuesById',
      valueKey: 'chacho',
      valueId: 'name',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ chacho: undefined, bar: undefined, tio: undefined, '': undefined });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('valuesById query SELECT ok get column bad key', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY}`, {
      format: 'valuesById',
      valueKey: 'id',
      valueId: 'chacho',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({});
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('query SELECT ok get valuesById column key fnSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY}`, {
      format: 'valuesById',
      valueKey: 'id',
      valueId: 'name',
      fnSanitize: (value: number) => ({ userId: value }),
    });
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

describe('array query SELECT', () => {
  test('array query SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROMM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'array',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual(false);
    expect(lastQuery.count).toBe(null);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('array query SELECT ok', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'array',
    });
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

  test('query SELECT ok get array fnSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'array',
      fnSanitize: (object: any) => {
        object.extra = true;
        return object;
      },
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual([
      { id: 1, name: 'chacho', extra: true },
      { id: 2, name: 'bar', extra: true },
      { id: 3, name: 'tio', extra: true },
      { id: 5, name: '', extra: true },
    ]);
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('query SELECT ok get array fnValueSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'array',
      fnValueSanitize: (value: any, key: string) => (key === 'name' && value.length === 0 ? 'default' : String(value)),
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual([
      { id: '1', name: 'chacho' },
      { id: '2', name: 'bar' },
      { id: '3', name: 'tio' },
      { id: '5', name: 'default' },
    ]);
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('query SELECT ok get array fnSanitize fnValueSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'array',
      fnSanitize: (object: any) => {
        object.extra = true;
        return object;
      },
      fnValueSanitize: (value: any, key: string) => (key === 'name' && value.length === 0 ? 'default' : String(value)),
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual([
      { id: '1', name: 'chacho', extra: true },
      { id: '2', name: 'bar', extra: true },
      { id: '3', name: 'tio', extra: true },
      { id: '5', name: 'default', extra: true },
    ]);
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });
});

describe('arrayById query SELECT', () => {
  test('arrayById query SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROMM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'arrayById',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual(false);
    expect(lastQuery.count).toBe(null);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('arrayById query SELECT ok get default', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'arrayById',
    });
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

  test('arrayById query SELECT ok get column', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'arrayById',
      valueKey: 'name',
    });
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

  test('arrayById query SELECT ok get bad column', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'arrayById',
      valueKey: 'chacho',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({});
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('query SELECT ok get arrayById column fnSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'arrayById',
      valueKey: 'name',
      fnSanitize: (object: any) => {
        object.extra = true;
        return object;
      },
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({
      chacho: { id: 1, name: 'chacho', extra: true },
      bar: { id: 2, name: 'bar', extra: true },
      tio: { id: 3, name: 'tio', extra: true },
      '': { id: 5, name: '', extra: true },
    });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('query SELECT ok get arrayById column fnValueSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'arrayById',
      valueKey: 'name',
      fnValueSanitize: (value: any, key: string) => (key === 'name' && value.length === 0 ? 'default' : value),
    });
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

  test('query SELECT ok get arrayById column fnSanitize fnValueSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'arrayById',
      valueKey: 'name',
      fnSanitize: (object: any) => {
        object.extra = true;
        return object;
      },
      fnValueSanitize: (value: any, key: string) => (key === 'name' && value.length === 0 ? 'default' : value),
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({
      chacho: { id: 1, name: 'chacho', extra: true },
      bar: { id: 2, name: 'bar', extra: true },
      tio: { id: 3, name: 'tio', extra: true },
      default: { id: 5, name: 'default', extra: true },
    });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });
});

describe('row query SELECT', () => {
  test('row query SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROMM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'row',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual(false);
    expect(lastQuery.count).toBe(null);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('row query SELECT ok get', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'row',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ id: 1, name: 'chacho' });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('row query SELECT ok get 2', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'row',
      valueKey: 2,
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ id: 3, name: 'tio' });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('row query SELECT ok get bad 999', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'row',
      valueKey: 999,
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual(undefined);
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('query SELECT ok get row fnSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'row',
      valueKey: 0,
      fnSanitize: (object: any) => {
        object.extra = true;
        return object;
      },
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ id: 1, name: 'chacho', extra: true });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('query SELECT ok get row fnValueSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'row',
      valueKey: 0,
      fnValueSanitize: (value: any) => (value ? `user-${value}` : value),
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ id: 'user-1', name: 'user-chacho' });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });

  test('query SELECT ok get row fnSanitize fnValueSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} ORDER BY id ASC`, {
      format: 'row',
      valueKey: 0,
      fnSanitize: (object: any) => {
        object.extra = true;
        return object;
      },
      fnValueSanitize: (value: any) => (value ? `user-${value}` : value),
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual({ id: 'user-1', name: 'user-chacho', extra: true });
    expect(lastQuery.count).toBe(4);
    expect(lastQuery.status).toBe(true);
  });
});

describe('rowStrict query SELECT', () => {
  test('rowStrict query SELECT bad', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROMM ${TABLE_NAME_EASY} WHERE id = 5`, {
      format: 'rowStrict',
    });
    await oMysql.poolClose();

    const lastQuery = oMysql.getLastQuery();

    expect(result).toEqual(false);
    expect(lastQuery.count).toBe(null);
    expect(lastQuery.status).toBe(false);
    expect(lastQuery.error?.type).toBe('wrong-query');
  });

  test('rowStrict query SELECT ok', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result1 = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} WHERE id = 5`, {
      format: 'row',
    });
    const result2 = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} WHERE id = 5`, {
      format: 'rowStrict',
    });
    await oMysql.poolClose();

    expect(result1).toEqual({ id: 5, name: '' });
    expect(result2).toEqual({ id: 5 });
  });

  test('rowStrict query SELECT ok bad 999', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} WHERE id = 5`, {
      format: 'rowStrict',
      valueKey: 999,
    });
    await oMysql.poolClose();

    expect(result).toEqual(undefined);
  });

  test('rowStrict query SELECT ok get fnSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result2 = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} WHERE id = 5`, {
      format: 'rowStrict',
      valueKey: 0,
      fnSanitize: (object: any) => {
        object.extra = true;
        return object;
      },
    });
    await oMysql.poolClose();

    expect(result2).toEqual({ id: 5, extra: true });
  });

  test('rowStrict query SELECT ok get fnValueSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result2 = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} WHERE id = 5`, {
      format: 'rowStrict',
      valueKey: 0,
      fnValueSanitize: (value: any, key: string) => (key === 'id' ? `user-${value}` : value),
    });
    await oMysql.poolClose();

    expect(result2).toEqual({ id: 'user-5' });
  });

  test('rowStrict query SELECT ok get fnSanitize fnValueSanitize', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: DATABASE_NAME });

    await oMysql.poolOpen();
    const result2 = await oMysql.query(`SELECT * FROM ${TABLE_NAME_EASY} WHERE id = 5`, {
      format: 'rowStrict',
      valueKey: 0,
      fnSanitize: (object: any) => {
        object.extra = true;
        return object;
      },
      fnValueSanitize: (value: any, key: string) => (key === 'id' ? 0 : value),
    });
    await oMysql.poolClose();

    expect(result2).toEqual({ extra: true });
  });
});
