import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
    const { user, boost } = req.body;

    if (!user || typeof boost !== 'number') {
        return res.status(400).json({ error: 'Invalid parameters' });
    }

    // Simulated on-chain interaction (you can expand with ethers.js later)
    console.log(`Boost set for ${user}: ${boost}%`);

    return res.json({ success: true, message: `Boost applied to ${user}`, boost });
});

export default router;
