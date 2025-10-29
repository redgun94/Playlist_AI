import 'dotenv/config';
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import connectDB from './config/database.js';

const app = express();

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: '🎵 PlAIlist Backend API funcionando!' });
});

// Puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT',gracefulShutdown);

async function gracefulShutdown(signal) {
    console.log('\n Shutdown the server...');
    try {
        await mongoose.connection.close();
        console.log('Cx closed');
    } catch (error) {
        console.log('Error found :', error);
    }
    process.exit(0);
}