import { sequelize } from './config/database';
import { Company } from './models/Company';
import { Product } from './models/Product';
import { User } from './models/User';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    console.log('Veritabanına bağlanılıyor...');
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı.');

    // Senkronizasyon (Opsiyonel, zaten yapılmış olmalı ama tabloların hazır olduğundan emin olalım)
    await sequelize.sync();

    console.log('Sahte kullanıcı oluşturuluyor...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        passwordHash: hashedPassword,
      },
    });

    console.log('Sahte şirketler oluşturuluyor...');
    const companiesData = [
      {
        name: 'TechNova Solutions',
        legalNumber: 'TR-987654321',
        incorporationCountry: 'Turkey',
        website: 'https://technova.example.com',
      },
      {
        name: 'Global Logistics Corp',
        legalNumber: 'US-123456789',
        incorporationCountry: 'USA',
        website: 'https://globallogistics.example.com',
      },
      {
        name: 'Green Energy Ltd.',
        legalNumber: 'UK-456789123',
        incorporationCountry: 'United Kingdom',
        website: 'https://greenenergy.example.co.uk',
      },
      {
        name: 'Quantum Computing GmbH',
        legalNumber: 'DE-789123456',
        incorporationCountry: 'Germany',
        website: 'https://quantum-computing.example.de',
      },
      {
        name: 'Oceanside Trading',
        legalNumber: 'JP-321654987',
        incorporationCountry: 'Japan',
        website: 'https://oceanside.example.jp',
      },
    ];

    const createdCompanies = await Company.bulkCreate(companiesData, { returning: true, ignoreDuplicates: true });
    
    // Eğer ignoreDuplicates işe yararsa ya da zaten varsa veritabanından güncel hallerini alalım
    const allCompanies = await Company.findAll();

    if (allCompanies.length > 0) {
      console.log('Sahte ürünler oluşturuluyor...');
      const productsData = [
        {
          name: 'Nova Server Blade X1',
          category: 'Hardware',
          amount: 50,
          amountUnit: 'Pieces',
          companyId: allCompanies[0].id,
        },
        {
          name: 'Cloud Storage 1TB',
          category: 'Software',
          amount: 5000,
          amountUnit: 'Licenses',
          companyId: allCompanies[0].id,
        },
        {
          name: 'Freight Container 40ft',
          category: 'Logistics',
          amount: 120,
          amountUnit: 'Units',
          companyId: allCompanies[1].id,
        },
        {
          name: 'Tracking Software Suite',
          category: 'Software',
          amount: 300,
          amountUnit: 'Licenses',
          companyId: allCompanies[1].id,
        },
        {
          name: 'Solar Panel Pro 500W',
          category: 'Energy',
          amount: 1500,
          amountUnit: 'Pieces',
          companyId: allCompanies[2].id,
        },
        {
          name: 'Wind Turbine Generator',
          category: 'Energy',
          amount: 15,
          amountUnit: 'Units',
          companyId: allCompanies[2].id,
        },
        {
          name: 'Quantum Processor QPU-9',
          category: 'Hardware',
          amount: 5,
          amountUnit: 'Pieces',
          companyId: allCompanies[3].id,
        },
        {
          name: 'AI Training Framework',
          category: 'Software',
          amount: 100,
          amountUnit: 'Licenses',
          companyId: allCompanies[3].id,
        },
        {
          name: 'Silk Fabric Roll',
          category: 'Textile',
          amount: 1000,
          amountUnit: 'Meters',
          companyId: allCompanies[4].id,
        },
        {
          name: 'Matcha Green Tea Premium',
          category: 'Food & Beverage',
          amount: 500,
          amountUnit: 'Kilograms',
          companyId: allCompanies[4].id,
        },
      ];

      await Product.bulkCreate(productsData, { ignoreDuplicates: true });
    }

    console.log('✅ Sahte veriler başarıyla eklendi!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Veri eklenirken hata oluştu:', error);
    process.exit(1);
  }
};

seedDatabase();
