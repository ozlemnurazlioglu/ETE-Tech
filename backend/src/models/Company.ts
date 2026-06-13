import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface CompanyAttributes {
  id: number;
  name: string;
  legalNumber: string;
  incorporationCountry: string;
  website: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CompanyCreationAttributes extends Optional<CompanyAttributes, 'id'> {}

export class Company extends Model<CompanyAttributes, CompanyCreationAttributes> implements CompanyAttributes {
  declare id: number;
  declare name: string;
  declare legalNumber: string;
  declare incorporationCountry: string;
  declare website: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Company.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    legalNumber: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    incorporationCountry: {
      type: DataTypes.STRING(128),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
  },
  {
    sequelize,
    tableName: 'companies',
    timestamps: true,
  }
);
