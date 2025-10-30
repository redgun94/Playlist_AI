import 'dotenv/config';
import express, { Application, urlencoded } from 'express';
import cors from 'cors';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import mongoose from 'mongoose';


const app: Application = express();

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta
app.use('/api/auth', authRoutes);
// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: '🎵 PlAIlist Backend API funcionando con TypeScript!' });
});
// Puerto
const PORT: number = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT',gracefulShutdown);

async function gracefulShutdown(signal:string):Promise<void> {
    console.log('\n Shutdown the server...');
    try {
        await mongoose.connection.close();
        console.log('Cx closed');
    } catch (error) {
        console.log('Error found :', error);
    }
    process.exit(0);
}