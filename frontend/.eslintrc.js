module.exports = {
  root: true,
  extends: ['universe/native'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
