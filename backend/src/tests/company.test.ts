import request from 'supertest';
import app from '../app';
import { Company } from '../models/Company';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';
const mockToken = jwt.sign({ id: 1, username: 'testuser' }, JWT_SECRET, { expiresIn: '1h' });

// Mock the Company model
jest.mock('../models/Company', () => {
  return {
    Company: {
      findAndCountAll: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    },
  };
});

describe('Company Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/companies', () => {
    it('should return 401 if token is missing', async () => {
      const response = await request(app).get('/api/companies');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Authorization token not found. Please log in.');
    });

    it('should return companies list with valid token', async () => {
      const mockCompanies = [
        { id: 1, name: 'Tech Company', legalNumber: '12345', incorporationCountry: 'TR', website: 'https://tech.com' }
      ];
      (Company.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockCompanies,
      });

      const response = await request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('companies');
      expect(response.body.companies).toHaveLength(1);
      expect(response.body.total).toBe(1);
    });
  });

  describe('GET /api/companies/:id', () => {
    it('should return a company by id', async () => {
      const mockCompany = { id: 1, name: 'Tech Company', legalNumber: '12345', incorporationCountry: 'TR', website: 'https://tech.com' };
      (Company.findByPk as jest.Mock).mockResolvedValue(mockCompany);

      const response = await request(app)
        .get('/api/companies/1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Tech Company');
    });

    it('should return 404 if company is not found', async () => {
      (Company.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/companies/999')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Company not found.');
    });
  });

  describe('POST /api/companies', () => {
    it('should create a new company successfully', async () => {
      const newCompanyData = {
        name: 'New Company',
        legalNumber: '54321',
        incorporationCountry: 'US',
        website: 'https://newcompany.com'
      };

      (Company.findOne as jest.Mock).mockResolvedValue(null);
      (Company.create as jest.Mock).mockResolvedValue({ id: 2, ...newCompanyData });

      const response = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(newCompanyData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Company added successfully.');
      expect(response.body.company).toHaveProperty('name', 'New Company');
    });

    it('should return 400 if validation fails', async () => {
      const incompleteData = { name: 'New Company' }; // Missing legalNumber etc.

      const response = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(incompleteData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'All fields (Company Name, Legal Number, Country, Website) are required.');
    });

    it('should return 400 if legal number already exists', async () => {
      const companyData = {
        name: 'New Company',
        legalNumber: '12345',
        incorporationCountry: 'TR',
        website: 'https://tech.com'
      };

      (Company.findOne as jest.Mock).mockResolvedValue({ id: 1, name: 'Tech Company', legalNumber: '12345' });

      const response = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(companyData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'A company with this Legal Number is already registered.');
    });
  });

  describe('PUT /api/companies/:id', () => {
    it('should update a company successfully', async () => {
      const updatedData = {
        name: 'Updated Company',
        legalNumber: '12345',
        incorporationCountry: 'TR',
        website: 'https://updated.com'
      };

      const mockCompanyInstance = {
        id: 1,
        name: 'Tech Company',
        legalNumber: '12345',
        update: jest.fn().mockResolvedValue(true)
      };

      (Company.findByPk as jest.Mock).mockResolvedValue(mockCompanyInstance);
      (Company.findOne as jest.Mock).mockResolvedValue(null); // No other duplicate company

      const response = await request(app)
        .put('/api/companies/1')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Company updated successfully.');
      expect(mockCompanyInstance.update).toHaveBeenCalledWith(updatedData);
    });
  });

  describe('DELETE /api/companies/:id', () => {
    it('should delete a company successfully', async () => {
      const mockCompanyInstance = {
        id: 1,
        name: 'Tech Company',
        destroy: jest.fn().mockResolvedValue(true)
      };

      (Company.findByPk as jest.Mock).mockResolvedValue(mockCompanyInstance);

      const response = await request(app)
        .delete('/api/companies/1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Company and all associated products successfully deleted.');
      expect(mockCompanyInstance.destroy).toHaveBeenCalled();
    });
  });
});
