import request from 'supertest';
import app from '../app';
import { Company } from '../models/Company';
import { Product } from '../models/Product';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';
const mockToken = jwt.sign({ id: 1, username: 'testuser' }, JWT_SECRET, { expiresIn: '1h' });

// Mock models
jest.mock('../models/Company', () => {
  return {
    Company: {
      count: jest.fn(),
      findAll: jest.fn(),
    },
  };
});

jest.mock('../models/Product', () => {
  return {
    Product: {
      count: jest.fn(),
      findAll: jest.fn(),
    },
  };
});

describe('Dashboard Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/dashboard/stats', () => {
    it('should return dashboard stats with correct format', async () => {
      (Company.count as jest.Mock).mockResolvedValue(5);
      (Product.count as jest.Mock).mockResolvedValue(10);
      (Company.findAll as jest.Mock).mockResolvedValue([
        { id: 1, name: 'Company 1' },
        { id: 2, name: 'Company 2' },
      ]);
      (Product.findAll as jest.Mock)
        .mockResolvedValueOnce([
          { id: 1, name: 'Product 1' },
          { id: 2, name: 'Product 2' },
        ]) // first call of Product.findAll (latest products)
        .mockResolvedValueOnce([
          { category: 'Hardware', count: 3 },
          { category: 'Software', count: 7 },
        ]) // second call of Product.findAll (category count stats)
        .mockResolvedValueOnce([
          { category: 'Hardware', totalAmount: 150 },
          { category: 'Software', totalAmount: 1200 },
        ]); // third call of Product.findAll (category amount stats)

      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalCompanies', 5);
      expect(response.body).toHaveProperty('totalProducts', 10);
      expect(response.body).toHaveProperty('latestCompanies');
      expect(response.body).toHaveProperty('latestProducts');
      expect(response.body).toHaveProperty('categoryStats');
      expect(response.body).toHaveProperty('categoryAmountStats');
    });
  });
});
