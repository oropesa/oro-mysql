import { OMysql } from '../../';

describe('tools sanitize', () => {
  test('tool obj sanitize char', async () => {
    const oMysql = new OMysql();

    expect(oMysql.sanitize(`chacho`)).toBe(`'chacho'`);
    expect(oMysql.sanitize(`'chacho'`)).toBe(`'\\'chacho\\''`);
  });

  test('tool static sanitize char', async () => {
    expect(OMysql.sanitize(`chacho`)).toBe(`'chacho'`);
    expect(OMysql.sanitize(`'chacho'`)).toBe(`'\\'chacho\\''`);
    expect(OMysql.sanitize(`"chacho"`)).toBe(`'\\"chacho\\"'`);
    expect(OMysql.sanitize(`' OR 1 = 1;`)).toBe(`'\\' OR 1 = 1;'`);
  });

  test('tool static sanitize number', async () => {
    expect(OMysql.sanitize(5)).toBe(`5`);
    expect(OMysql.sanitize('5')).toBe(`'5'`);
  });

  test('tool static sanitize null', async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    expect(OMysql.sanitize(undefined)).toBe(`NULL`);
    expect(OMysql.sanitize(null)).toBe(`NULL`);
    expect(OMysql.sanitize('NULL')).toBe(`'NULL'`);
  });

  test('tool static sanitize bool', async () => {
    expect(OMysql.sanitize(true)).toBe(`1`);
    expect(OMysql.sanitize(false)).toBe(`0`);
  });

  test('tool static sanitize array', async () => {
    expect(OMysql.sanitize([1, 2, 3])).toBe(`'[1,2,3]'`);
  });

  test('tool static sanitize obj', async () => {
    expect(OMysql.sanitize({ chacho: 'loco', tio: 1 })).toBe(`'{\\"chacho\\":\\"loco\\",\\"tio\\":1}'`);
    expect(OMysql.sanitize({ chACho: "' OR 1 = 1;" })).toBe(`'{\\"chACho\\":\\"\\' OR 1 = 1;\\"}'`);
  });
});
