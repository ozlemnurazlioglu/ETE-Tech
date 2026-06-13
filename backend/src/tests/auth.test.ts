import request from 'supertest';
import app from '../app';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

// Mock the User model
jest.mock('../models/User', () => {
  return {
    User: {
      findOne: jest.fn(),
      create: jest.fn(),
    },
  };
});

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Setup mock behavior
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'testuser',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'securepassword123' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Registration successful! You can now log in.');
      expect(response.body.user).toHaveProperty('username', 'testuser');
      expect(User.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
      expect(User.create).toHaveBeenCalled();
    });

    it('should return 400 if username already exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ id: 1, username: 'testuser' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'securepassword123' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'This username is already taken.');
      expect(User.create).not.toHaveBeenCalled();
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'ts', password: '123' }); // Too short

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should log in a user successfully and return a token', async () => {
      const hashedPassword = await bcrypt.hash('securepassword123', 10);
      (User.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'testuser',
        passwordHash: hashedPassword,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'securepassword123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful!');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', 'testuser');
    });

    it('should return 401 if password is invalid', async () => {
      const hashedPassword = await bcrypt.hash('securepassword123', 10);
      (User.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'testuser',
        passwordHash: hashedPassword,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Incorrect username or password.');
    });

    it('should return 401 if user does not exist', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Incorrect username or password.');
    });
  });
});
