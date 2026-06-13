import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Product } from '../models/Product';
import { Company } from '../models/Company';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { search, sortBy, sortOrder, page, limit, companyId } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    // Build query conditions
    const whereCondition: any = {};
    
    if (companyId) {
      whereCondition.companyId = parseInt(companyId as string, 10);
    }

    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } },
        { amountUnit: { [Op.iLike]: `%${search}%` } },
        // We can also allow searching by company name if we query with an association
        { '$company.name$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Build sorting
    const order: any = [];
    if (sortBy) {
      const orderDir = (sortOrder as string)?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      if (sortBy === 'company.name') {
        order.push([{ model: Company, as: 'company' }, 'name', orderDir]);
      } else {
        order.push([sortBy as string, orderDir]);
      }
    } else {
      order.push(['createdAt', 'DESC']); // Default to newest
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'legalNumber'],
        },
      ],
      order,
      limit: limitNum,
      offset,
    });

    return res.status(200).json({
      products,
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (error: any) {
    console.error('Error listing products:', error);
    return res.status(500).json({ message: 'An error occurred while listing products.' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'legalNumber'],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.status(200).json(product);
  } catch (error: any) {
    console.error('Error retrieving product:', error);
    return res.status(500).json({ message: 'An error occurred while loading product details.' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, category, amount, amountUnit, companyId } = req.body;

    if (!name || !category || amount === undefined || !amountUnit || !companyId) {
      return res.status(400).json({ message: 'All fields (Product Name, Category, Quantity, Quantity Unit, Company) are required.' });
    }

    // Verify company exists
    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(400).json({ message: 'Selected company is not valid.' });
    }

    const product = await Product.create({
      name,
      category,
      amount: parseFloat(amount),
      amountUnit,
      companyId: parseInt(companyId, 10),
    });

    // Fetch created product with its company
    const createdProduct = await Product.findByPk(product.id, {
      include: [{ model: Company, as: 'company', attributes: ['id', 'name'] }]
    });

    return res.status(201).json({
      message: 'Product added successfully.',
      product: createdProduct,
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return res.status(500).json({ message: 'An error occurred while saving the product.' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, amount, amountUnit, companyId } = req.body;

    if (!name || !category || amount === undefined || !amountUnit || !companyId) {
      return res.status(400).json({ message: 'All fields (Product Name, Category, Quantity, Quantity Unit, Company) are required.' });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product to update not found.' });
    }

    // Verify company exists
    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(400).json({ message: 'Selected company is not valid.' });
    }

    await product.update({
      name,
      category,
      amount: parseFloat(amount),
      amountUnit,
      companyId: parseInt(companyId, 10),
    });

    const updatedProduct = await Product.findByPk(product.id, {
      include: [{ model: Company, as: 'company', attributes: ['id', 'name'] }]
    });

    return res.status(200).json({
      message: 'Product updated successfully.',
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return res.status(500).json({ message: 'An error occurred while updating the product.' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: 'Product to delete not found.' });
    }

    await product.destroy();

    return res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ message: 'An error occurred while deleting the product.' });
  }
};
