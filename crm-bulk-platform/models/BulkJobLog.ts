import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export class BulkJobLog extends Model<InferAttributes<BulkJobLog>, InferCreationAttributes<BulkJobLog>> {
  public id!: CreationOptional<number>;
  declare job_id: number;
  declare entity_id: number;
  declare status: string;
  declare message: string;
}

export const BulkJobLogFactory = (sequelize: Sequelize) => {
  BulkJobLog.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bulk_jobs',
        key: 'id',
      },
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'BulkJobLog',
    tableName: 'bulk_job_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return BulkJobLog;
};
