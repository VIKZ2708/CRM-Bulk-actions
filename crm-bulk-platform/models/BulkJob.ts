import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export class BulkJob extends Model<InferAttributes<BulkJob>, InferCreationAttributes<BulkJob>> {
  public id!: CreationOptional<number>;
  public scheduled_at!: Date | null;
  declare entity_type: string;
  declare action_type: string;
  declare total_count: number;
  declare success_count: number;
  declare failure_count: number;
  declare status: string;
}

export const BulkJobFactory = (sequelize: Sequelize) => {
  BulkJob.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    entity_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    action_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    total_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    success_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    failure_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    },
  }, {
    sequelize,
    modelName: 'BulkJob',
    tableName: 'bulk_jobs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return BulkJob;
};

