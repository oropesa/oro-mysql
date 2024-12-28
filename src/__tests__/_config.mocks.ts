import { Ofn } from 'oro-functions';

import type { OMysqlConfig } from '../';

// eslint-disable-next-line unicorn/prefer-module
export const DIRNAME = __dirname;

export const DATABASE_NAME = 'test_oromysql' as const;

export const CONFIG_BAD: OMysqlConfig = {
  host: 'host-unknown',
  database: 'example',
  user: 'user',
  password: 'password',
} as const;

export const CONFIG_BAD2: OMysqlConfig = {
  database: 'exampl_unknown',
  user: 'user',
  password: 'password',
} as const;

export const CONFIG_DEFAULT = Ofn.getFileJsonRecursivelySync<OMysqlConfig>(`${DIRNAME}/config.json`);
