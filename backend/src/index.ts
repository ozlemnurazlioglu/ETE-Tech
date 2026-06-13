import app from './app';
import { sequelize } from './models';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('Veritabanına bağlanılıyor...');
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarıyla kuruldu.');

    // Sync database models
    console.log('Veritabanı tabloları senkronize ediliyor...');
    await sequelize.sync({ alter: true }); // Alters tables if they already exist to match the model schema
    console.log('Tüm tablolar başarıyla senkronize edildi.');

    // Start Express Server
    app.listen(PORT, () => {
      console.log(`Sunucu ${PORT} portunda aktif.`);
    });
  } catch (error) {
    console.error('Sunucu başlatılırken kritik hata oluştu:', error);
    process.exit(1);
  }
};

startServer();
