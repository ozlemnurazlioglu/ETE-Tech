import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Company } from '../models/Company';

export const getAllCompanies = async (req: Request, res: Response) => {
  try {
    const { search, sortBy, sortOrder, page, limit } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    // Build query conditions
    const whereCondition: any = {};
    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { legalNumber: { [Op.iLike]: `%${search}%` } },
        { incorporationCountry: { [Op.iLike]: `%${search}%` } },
        { website: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Build sorting
    const order: any = [];
    if (sortBy) {
      const orderDir = (sortOrder as string)?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      order.push([sortBy as string, orderDir]);
    } else {
      order.push(['createdAt', 'DESC']); // Default to newest
    }

    const { count, rows: companies } = await Company.findAndCountAll({
      where: whereCondition,
      order,
      limit: limitNum,
      offset,
    });

    return res.status(200).json({
      companies,
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (error: any) {
    console.error('Error listing companies:', error);
    return res.status(500).json({ message: 'An error occurred while listing companies.' });
  }
};

export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await Company.findByPk(id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found.' });
    }

    return res.status(200).json(company);
  } catch (error: any) {
    console.error('Error retrieving company:', error);
    return res.status(500).json({ message: 'An error occurred while loading company details.' });
  }
};

export const createCompany = async (req: Request, res: Response) => {
  try {
    const { name, legalNumber, incorporationCountry, website } = req.body;

    if (!name || !legalNumber || !incorporationCountry || !website) {
      return res.status(400).json({ message: 'All fields (Company Name, Legal Number, Country, Website) are required.' });
    }

    // Check if legal number already exists
    const existingCompany = await Company.findOne({ where: { legalNumber } });
    if (existingCompany) {
      return res.status(400).json({ message: 'A company with this Legal Number is already registered.' });
    }

    const company = await Company.create({
      name,
      legalNumber,
      incorporationCountry,
      website,
    });

    return res.status(201).json({
      message: 'Company added successfully.',
      company,
    });
  } catch (error: any) {
    console.error('Error creating company:', error);
    return res.status(500).json({ message: 'An error occurred while saving the company.' });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, legalNumber, incorporationCountry, website } = req.body;

    if (!name || !legalNumber || !incorporationCountry || !website) {
      return res.status(400).json({ message: 'All fields (Company Name, Legal Number, Country, Website) are required.' });
    }

    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ message: 'Company to update not found.' });
    }

    // Check if legal number is updated to another company's legal number
    if (legalNumber !== company.legalNumber) {
      const existingCompany = await Company.findOne({ where: { legalNumber } });
      if (existingCompany) {
        return res.status(400).json({ message: 'Another company with this Legal Number already exists.' });
      }
    }

    await company.update({
      name,
      legalNumber,
      incorporationCountry,
      website,
    });

    return res.status(200).json({
      message: 'Company updated successfully.',
      company,
    });
  } catch (error: any) {
    console.error('Error updating company:', error);
    return res.status(500).json({ message: 'An error occurred while updating the company.' });
  }
};

export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await Company.findByPk(id);

    if (!company) {
      return res.status(404).json({ message: 'Company to delete not found.' });
    }

    // Since we have cascading deleting, deleting company will also delete related products automatically
    await company.destroy();

    return res.status(200).json({ message: 'Company and all associated products successfully deleted.' });
  } catch (error: any) {
    console.error('Error deleting company:', error);
    return res.status(500).json({ message: 'An error occurred while deleting the company.' });
  }
};
