// /api/setBoost.js
import { ethers } from 'ethers';
import stakingAbi from '../abis/stakingAbi.json'; // adjust if your path is different

export default async function handler(req, res) {
    // ✅ Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); // Replace * with frontend domain if needed
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end(); // Allow CORS preflight
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { user, boost } = req.body;

    if (!user || boost === undefined) {
        return res.status(400).json({ error: 'Missing user or boost' });
    }

    try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const stakingContract = new ethers.Contract(process.env.STAKING_CONTRACT, stakingAbi, wallet);

        const tx = await stakingContract.setUserBoostApy(user, boost);
        await tx.wait();

        res.status(200).json({ success: true, txHash: tx.hash });
    } catch (err) {
        console.error('Boost Error:', err);
        res.status(500).json({ error: 'Boost failed', message: err.message });
    }
}
