import mongoose from 'mongoose';

// Lista de URIs para tentar em diferentes portas e configurações
const mongoUrisToTry = [
  // URI original com SRV (recomendada)
  {
    uri: process.env.MONGODB_URI || 'mongodb+srv://adminAdmin:MEqSRkjLzsdVVEYD@prjmonitoraapan.cbun2hq.mongodb.net/monitoraapan?authSource=admin&retryWrites=true&w=majority&appName=prjMonitoraApan',
    description: 'SRV (MongoDB Atlas padrão)'
  },
  // Tentar porta 27018
  {
    uri: 'mongodb://adminAdmin:MEqSRkjLzsdVVEYD@prjmonitoraapan.cbun2hq.mongodb.net:27018/monitoraapan?authSource=admin&retryWrites=true&w=majority&ssl=true&appName=prjMonitoraApan',
    description: 'Porta 27018'
  },
  // Tentar porta 443 (HTTPS)
  {
    uri: 'mongodb://adminAdmin:MEqSRkjLzsdVVEYD@prjmonitoraapan.cbun2hq.mongodb.net:443/monitoraapan?authSource=admin&retryWrites=true&w=majority&ssl=true&appName=prjMonitoraApan',
    description: 'Porta 443 (HTTPS)'
  },
  // Tentar com os shards em porta 27017
  {
    uri: 'mongodb://adminAdmin:MEqSRkjLzsdVVEYD@prjmonitoraapan-shard-00-00.cbun2hq.mongodb.net:27017,prjmonitoraapan-shard-00-01.cbun2hq.mongodb.net:27017,prjmonitoraapan-shard-00-02.cbun2hq.mongodb.net:27017/monitoraapan?authSource=admin&retryWrites=true&w=majority&ssl=true&appName=prjMonitoraApan',
    description: 'Shards em porta 27017'
  },
  // Tentar com os shards em porta 27018
  {
    uri: 'mongodb://adminAdmin:MEqSRkjLzsdVVEYD@prjmonitoraapan-shard-00-00.cbun2hq.mongodb.net:27018,prjmonitoraapan-shard-00-01.cbun2hq.mongodb.net:27018,prjmonitoraapan-shard-00-02.cbun2hq.mongodb.net:27018/monitoraapan?authSource=admin&retryWrites=true&w=majority&ssl=true&appName=prjMonitoraApan',
    description: 'Shards em porta 27018'
  },
];

let currentUriIndex = 0;

export const connectDB = async () => {
  const tryConnection = async (index: number): Promise<boolean> => {
    if (index >= mongoUrisToTry.length) {
      return false;
    }

    const { uri, description } = mongoUrisToTry[index];
    currentUriIndex = index;

    try {
      console.log(`\n🔄 Tentativa ${index + 1}/${mongoUrisToTry.length}: ${description}`);
      
      await mongoose.connect(uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        directConnection: false,
        family: 4,
      });
      
      console.log('✅ MongoDB conectado com sucesso!');
      console.log('📊 Banco de dados:', mongoose.connection.db?.databaseName || 'monitoraapan');
      console.log('🔌 Host:', mongoose.connection.host);
      console.log('✨ Conectado via:', description);
      return true;
    } catch (error) {
      console.error(`❌ Falha na tentativa ${index + 1}`);
      if (error instanceof Error) {
        console.error('   Erro:', error.message.substring(0, 100));
      }
      
      // Tentar próxima configuração
      return tryConnection(index + 1);
    }
  };

  const connected = await tryConnection(0);
  
  if (!connected) {
    console.error('\n❌ Falha ao conectar ao MongoDB em TODAS as tentativas');
    console.error('⚠️  Sistema continuará em modo JSON local');
  }
};

