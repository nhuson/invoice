export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_NAME ?? 'simple_invoice',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-me-in-env',
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN ?? '3600', 10),
  }
});
