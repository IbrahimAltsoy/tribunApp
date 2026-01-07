module.exports = function (api) {
  api.cache(true);

  const isProduction = process.env.NODE_ENV === 'production';

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Remove console.* statements in production builds
      isProduction && [
        'transform-remove-console',
        {
          exclude: ['error', 'warn'], // Keep error and warn for critical issues
        },
      ],
    ].filter(Boolean),
    env: {
      production: {
        plugins: [
          ['transform-remove-console', { exclude: ['error', 'warn'] }],
        ],
      },
    },
  };
};