import {
  DEFAULT_IGNORES,
  setEslintLanguageOptionsBrowser,
  setEslintPluginJest,
  setEslintPluginJestDom,
  setEslintPluginPrettier,
  setEslintPluginTypescriptEslint,
  setEslintPluginUnicorn,
} from './eslint.config.utils.js';

const allowList = [
  'fn',
  'Fn',
  'db',
  'dev',
  'Dev',
  'tmp',
  'obj',
  'str',
  'utils',
  'opts',
  'Opts',
  'args',
  'Args',
  'param',
  'params',
  'Params',
];

export default [
  { ignores: DEFAULT_IGNORES },
  setEslintLanguageOptionsBrowser(),
  setEslintPluginUnicorn({ allowList }),
  setEslintPluginJest(),
  setEslintPluginJestDom(),
  setEslintPluginPrettier(),
  ...setEslintPluginTypescriptEslint({
    rules: {
      'max-params': ['error', 5],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }),
];
