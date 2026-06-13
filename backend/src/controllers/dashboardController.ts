import { Request, Response } from 'express';
import { Company } from '../models/Company';
import { Product } from '../models/Product';
import { sequelize } from '../config/database';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalCompanies = await Company.count();
    const totalProducts = await Product.count();

    const latestCompanies = await Company.findAll({
      order: [['createdAt', 'DESC']],
      limit: 3,
      attributes: ['id', 'name', 'legalNumber', 'incorporationCountry', 'createdAt'],
    });

    const latestProducts = await Product.findAll({
      order: [['createdAt', 'DESC']],
      limit: 3,
      include: [{ model: Company, as: 'company', attributes: ['name'] }],
      attributes: ['id', 'name', 'category', 'amount', 'amountUnit', 'createdAt'],
    });

    // Creative reports: Product count by Category
    const categoryStats = await Product.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['category'],
      raw: true,
    });

    // Creative reports: Total amount of products by category
    const categoryAmountStats = await Product.findAll({
      attributes: [
        'category',
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
      ],
      group: ['category'],
      raw: true,
    });

    return res.status(200).json({
      totalCompanies,
      totalProducts,
      latestCompanies,
      latestProducts,
      categoryStats,
      categoryAmountStats,
    });
  } catch (error: any) {
    console.error('Failed to fetch dashboard statistics:', error);
    return res.status(500).json({ message: 'An error occurred while loading dashboard statistics.' });
  }
};
