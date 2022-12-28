const isDev = process.env.NODE_ENV === 'development';

export const config = {
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  dialect: 'postgres',
  migrationStorageTableName: 'sequelize_meta',
  seederStorage: 'sequelize',
  seederStorageTableName: 'sequelize_data',
  logging: str => {
    !isDev || console.log(str);
  },
};

export default {
  development: config,
  test: config,
  production: config,
};
