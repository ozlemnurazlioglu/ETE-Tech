import request from 'supertest';
import app from '../app';
import { Product } from '../models/Product';
import { Company } from '../models/Company';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';
const mockToken = jwt.sign({ id: 1, username: 'testuser' }, JWT_SECRET, { expiresIn: '1h' });

// Mock models
jest.mock('../models/Product', () => {
  return {
    Product: {
      findAndCountAll: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
    },
  };
});

jest.mock('../models/Company', () => {
  return {
    Company: {
      findByPk: jest.fn(),
    },
  };
});

describe('Product Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should return products list with valid token', async () => {
      const mockProducts = [
        { id: 1, name: 'Laptop', category: 'Elec', amount: 10, amountUnit: 'Pcs', companyId: 1 }
      ];
      (Product.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockProducts,
      });

      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(response.body.products).toHaveLength(1);
      expect(response.body.total).toBe(1);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a product by id', async () => {
      const mockProduct = { id: 1, name: 'Laptop', category: 'Elec', amount: 10, amountUnit: 'Pcs', companyId: 1 };
      (Product.findByPk as jest.Mock).mockResolvedValue(mockProduct);

      const response = await request(app)
        .get('/api/products/1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Laptop');
    });

    it('should return 404 if product is not found', async () => {
      (Product.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/products/999')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Product not found.');
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product successfully', async () => {
      const productData = {
        name: 'Smart Phone',
        category: 'Electronics',
        amount: 25,
        amountUnit: 'Units',
        companyId: 1,
      };

      (Company.findByPk as jest.Mock).mockResolvedValue({ id: 1, name: 'Tech Co' });
      (Product.create as jest.Mock).mockResolvedValue({ id: 2, ...productData });
      (Product.findByPk as jest.Mock).mockResolvedValue({
        id: 2,
        ...productData,
        company: { id: 1, name: 'Tech Co' }
      });

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(productData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Product added successfully.');
      expect(response.body.product).toHaveProperty('name', 'Smart Phone');
    });

    it('should return 400 if associated company does not exist', async () => {
      const productData = {
        name: 'Smart Phone',
        category: 'Electronics',
        amount: 25,
        amountUnit: 'Units',
        companyId: 999, // Invalid company
      };

      (Company.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(productData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Selected company is not valid.');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product successfully', async () => {
      const updatedData = {
        name: 'Updated Laptop',
        category: 'Electronics',
        amount: 15,
        amountUnit: 'Pieces',
        companyId: 1
      };

      const mockProductInstance = {
        id: 1,
        name: 'Laptop',
        companyId: 1,
        update: jest.fn().mockResolvedValue(true)
      };

      (Product.findByPk as jest.Mock)
        .mockResolvedValueOnce(mockProductInstance) // first call findByPk(id)
        .mockResolvedValueOnce({ id: 1, ...updatedData, company: { id: 1, name: 'Tech Co' } }); // second call findByPk in updated response

      (Company.findByPk as jest.Mock).mockResolvedValue({ id: 1, name: 'Tech Co' });

      const response = await request(app)
        .put('/api/products/1')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Product updated successfully.');
      expect(mockProductInstance.update).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product successfully', async () => {
      const mockProductInstance = {
        id: 1,
        name: 'Laptop',
        destroy: jest.fn().mockResolvedValue(true)
      };

      (Product.findByPk as jest.Mock).mockResolvedValue(mockProductInstance);

      const response = await request(app)
        .delete('/api/products/1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Product deleted successfully.');
      expect(mockProductInstance.destroy).toHaveBeenCalled();
    });
  });
});
