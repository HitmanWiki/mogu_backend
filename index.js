import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import setBoostRoute from './api/setBoost.js';
import inventoryRoute from './api/inventory.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Register API routes
app.use('/api/setBoost', setBoostRoute);
app.use('/api/inventory', inventoryRoute);

// Fallback route
app.get('/', (req, res) => {
    res.send('🚀 MOGU Backend is live!');
});

app.listen(PORT, () => {
    console.log(`🚀 MOGU Backend running on http://localhost:${PORT}`);
});
