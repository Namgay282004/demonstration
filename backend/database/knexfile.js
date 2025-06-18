module.exports = {
  client: 'pg',
  version: '12', // Use your actual Postgres version, or omit if not needed
  connection: {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: {
      rejectUnauthorized: false
    }
  },
  pool: {
    min: 1,
    max: 2
  },
  migrations: {
    tableName: 'knex_migrations'
  },
  debug: true
}