import {
  DEFAULT_IGNORES,
  setEslintLanguageOptionsBrowser,
  setEslintPluginJest,
  setEslintPluginPrettier,
  setEslintPluginTypescripEslint,
  setEslintPluginUnicorn,
} from './eslint.config.utils.js';

const allowList = ['fn', 'Fn', 'db', 'tmp', 'obj', 'str', 'opts', 'Opts', 'args', 'Args', 'param', 'params', 'Params'];

export default [
  { ignores: DEFAULT_IGNORES },
  setEslintLanguageOptionsBrowser(),
  setEslintPluginUnicorn({ allowList }),
  setEslintPluginJest(),
  setEslintPluginPrettier(),
  ...setEslintPluginTypescripEslint({
    rules: {
      'max-params': ['error', 5],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }),
];
