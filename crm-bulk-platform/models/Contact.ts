import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export class Contact extends Model<InferAttributes<Contact>, InferCreationAttributes<Contact>> {
  public id!: number;
  declare name: string;
  declare email: string;
  declare phone: string;
}

export const ContactFactory = (sequelize: Sequelize) => {
  Contact.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'Contact',
    tableName: 'contacts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Contact;
};
