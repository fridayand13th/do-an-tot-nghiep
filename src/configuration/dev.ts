export default () => ({
  app: {
    baseUrlPrefix: '/api',
    docsBaseUrl: '/docs',
  },
  accessToken: {
    expiresIn: '8h',
    secret: 'superSecretKey',
  },
  refreshToken: {
    expiresIn: '1d',
  },
});
