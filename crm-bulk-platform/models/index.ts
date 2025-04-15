// src/models/sequelize.ts
import { Sequelize } from 'sequelize';
import { config } from 'dotenv';
import { BulkJob, BulkJobFactory } from './BulkJob';
import { BulkJobLog, BulkJobLogFactory } from './BulkJobLog';
import { Contact, ContactFactory } from './Contact';

config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  logging: false,
});

BulkJobFactory(sequelize);
BulkJobLogFactory(sequelize);
ContactFactory(sequelize);

BulkJob.hasMany(BulkJobLog, { foreignKey: 'job_id', as: 'logs' });
BulkJobLog.belongsTo(BulkJob, { foreignKey: 'job_id', as: 'job' });

export { sequelize, BulkJob, BulkJobLog, Contact };
