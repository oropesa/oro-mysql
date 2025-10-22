import { Ofn } from 'oro-functions';
import { OTimer } from 'oro-timer';

import { OMysql } from '../../';
import { CONFIG_BAD, CONFIG_BAD2, CONFIG_DEFAULT } from '../_config.mocks';

//

describe('get OMysql defaults', () => {
  test('static get client is mysql2', async () => {
    const client = OMysql.getClient();
    expect(Ofn.isObject(client)).toBe(true);

    const keys = Object.keys(client);
    expect(keys.includes('createConnection')).toBe(true);
    expect(keys.includes('createPool')).toBe(true);
  });

  test('get client is mysql2', async () => {
    const oMysql = new OMysql(CONFIG_DEFAULT);

    const client = oMysql.getClient();
    expect(Ofn.isObject(client)).toBe(true);

    const keys = Object.keys(client);
    expect(keys.includes('createConnection')).toBe(true);
    expect(keys.includes('createPool')).toBe(true);
  });

  test('get db con', async () => {
    const oMysql = new OMysql(CONFIG_DEFAULT);

    await oMysql.poolOpen();
    const db = oMysql.getDB();
    await oMysql.poolClose();

    expect(Ofn.type(db, true)).toBe('PromiseConnection');
  });

  test('get default settings', async () => {
    const oMysql = new OMysql();

    expect(oMysql.getInfo()).toEqual({
      host: 'localhost',
      database: undefined,
      user: 'root',
      password: '',
    });
  });

  test('get info', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, database: 'test', password: 'password' });

    expect(oMysql.getInfo()).toEqual(
      expect.objectContaining({
        host: expect.stringMatching(/localhost|127.0.0.1/),
        database: 'test',
        user: CONFIG_DEFAULT.user,
        password: '********',
      }),
    );
  });

  test('get default status', async () => {
    const oMysql = new OMysql();

    expect(oMysql.status).toBe(false);
    expect(oMysql.getStatus()).toEqual({ status: false, error: { msg: 'Not connected yet.' } });
  });

  test('get status dis/connected', async () => {
    const oMysql = new OMysql(CONFIG_DEFAULT);

    await oMysql.poolOpen();

    const status = oMysql.status;
    const objStatus = oMysql.getStatus();

    await oMysql.poolClose();

    expect(status).toBe(true);
    expect(objStatus).toEqual({ status: true, msg: 'Connected successfully.' });

    expect(oMysql.status).toBe(false);
    expect(oMysql.getStatus()).toEqual({
      status: false,
      error: { msg: 'Disconnected successfully.' },
    });
  });
});

describe('init Bad OMysql', () => {
  test('new OMysql( bad-config )', async () => {
    const oMysql = new OMysql(CONFIG_BAD);

    const responseOpen = await oMysql.poolOpen();

    expect(responseOpen.status).toBe(false);
    if (responseOpen.status) {
      return;
    }

    expect(responseOpen.error.msg).toMatch(/Error: getaddrinfo (ENOTFOUND|EAI_AGAIN host-unknown)/);
  });

  test('new OMysql( bad-config2 )', async () => {
    const oMysql = new OMysql(CONFIG_BAD2);

    const responseOpen = await oMysql.poolOpen();
    await oMysql.poolClose();

    expect(responseOpen.status).toBe(false);
    if (responseOpen.status) {
      return;
    }

    expect(responseOpen.error.msg).toMatch(/Error|Error: (Access denied for user|connect ECONNREFUSED)/);
  });

  test('new OMysql( timeout-config )', async () => {
    const oMysql = new OMysql({ ...CONFIG_DEFAULT, connectTimeout: 1 });

    const responseOpen = await oMysql.poolOpen();

    // sometimes connection time is faster than 1
    if (responseOpen.status) {
      return;
    }

    expect(responseOpen.status).toBe(false);
    if (responseOpen.status) {
      return;
    }

    expect(responseOpen.error.msg).toBe(`Error: connect ETIMEDOUT`);
  });
});

describe('init OMysql', () => {
  test('new OMysql( config )', async () => {
    const oMysql = new OMysql(CONFIG_DEFAULT);

    const responseOpen = await oMysql.poolOpen();
    const responseClose = await oMysql.poolClose();

    expect(responseOpen.status).toBe(true);
    expect(responseClose.status).toBe(true);

    if (!responseOpen.status) {
      return;
    }

    expect(responseOpen.msg).toBe('Connected successfully.');
    expect(responseClose.msg).toBe('Disconnected successfully.');
  });

  test('new OMysql( config ) with oTimer default', async () => {
    const oMysql = new OMysql(CONFIG_DEFAULT);

    const oTimer = new OTimer('start test');

    const responseOpen = await oMysql.poolOpen({ oTimer });
    const responseClose = await oMysql.poolClose({ oTimer });

    const timesLabels = oTimer.getTimes({ addTotal: false }).map((t) => t.label);

    expect(responseOpen.status).toBe(true);
    expect(responseClose.status).toBe(true);

    if (!responseOpen.status) {
      return;
    }

    expect(responseOpen.msg).toBe('Connected successfully.');
    expect(responseClose.msg).toBe('Disconnected successfully.');
    expect(timesLabels).toEqual(['start test', 'mysqlPoolOpen', 'mysqlPoolClose']);
  });

  test('new OMysql( config ) with oTimer custom', async () => {
    const oMysql = new OMysql(CONFIG_DEFAULT);

    const oTimer = new OTimer('start test');

    const responseOpen = await oMysql.poolOpen({ oTimer, oTimerOpen: 'open sqlClient' });
    const responseClose = await oMysql.poolClose({ oTimer, oTimerClose: 'close sqlClient' });

    const timesLabels = oTimer.getTimes({ addTotal: false }).map((t) => t.label);

    expect(responseOpen.status).toBe(true);
    expect(responseClose.status).toBe(true);

    if (!responseOpen.status) {
      return;
    }

    expect(responseOpen.msg).toBe('Connected successfully.');
    expect(responseClose.msg).toBe('Disconnected successfully.');
    expect(timesLabels).toEqual(['start test', 'open sqlClient', 'close sqlClient']);
  });

  test('close without being opened', async () => {
    const oMysql = new OMysql(CONFIG_DEFAULT);

    const responseClose = await oMysql.poolClose();

    expect(responseClose.status).toBe(true);
    if (!responseClose.status) {
      return;
    }

    expect(responseClose.msg).toBe('It is already disconnected.');
  });

  test('open one close twice', async () => {
    const oMysql = new OMysql(CONFIG_DEFAULT);

    await oMysql.poolOpen();
    const responseClose = await oMysql.poolClose();
    const responseClose2 = await oMysql.poolClose();

    expect(responseClose.status).toBe(true);
    expect(responseClose2.status).toBe(true);

    if (!responseClose.status || !responseClose2.status) {
      return;
    }

    expect(responseClose.msg).toBe('Disconnected successfully.');
    expect(responseClose2.msg).toBe('It is already disconnected.');
  });

  test('open twice', async () => {
    const oMysql = new OMysql(CONFIG_DEFAULT);

    const responseOpen = await oMysql.poolOpen();
    const responseOpen2 = await oMysql.poolOpen();
    await oMysql.poolClose();

    expect(responseOpen.status).toBe(true);
    expect(responseOpen2.status).toBe(true);

    if (!responseOpen.status || !responseOpen2.status) {
      return;
    }

    expect(responseOpen.msg).toBe('Connected successfully.');
    expect(responseOpen2.msg).toBe('Connected successfully.');
  });
});
