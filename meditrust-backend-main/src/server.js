import './config/env.js';

import express from 'express';
import cors from 'cors';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import healthRecordRoutes from './routes/healthRecordRoutes.js';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true
  })
);

app.use(express.json());

await connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/health-records', healthRecordRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend working'
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
