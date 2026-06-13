import { sequelize } from '../config/database';
import { User } from './User';
import { Company } from './Company';
import { Product } from './Product';

// Establish associations
Company.hasMany(Product, {
  foreignKey: 'companyId',
  as: 'products',
  onDelete: 'CASCADE',
});

Product.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
});

export {
  sequelize,
  User,
  Company,
  Product,
};
