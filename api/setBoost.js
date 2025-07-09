import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

    try {
        const { user, boost } = req.body;
        if (!user || boost === undefined) return res.status(400).json({ error: 'Missing user or boost' });

        const RPC_URL = process.env.RPC_URL;
        const PRIVATE_KEY = process.env.PRIVATE_KEY;
        const STAKING_CONTRACT = process.env.STAKING_CONTRACT;

        if (!RPC_URL || !PRIVATE_KEY || !STAKING_CONTRACT) {
            console.error('Missing env vars');
            return res.status(500).json({ error: 'Server config error' });
        }

        // ✅ Dynamically load ABI from JSON file
        const abiPath = path.resolve(process.cwd(), 'abis', 'stakingAbi.json');
        const stakingAbi = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));

        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract(STAKING_CONTRACT, stakingAbi, wallet);

        const tx = await contract.setUserBoostApy(user, boost);
        await tx.wait();

        res.status(200).json({ success: true, txHash: tx.hash });
    } catch (err) {
        console.error('Boost error:', err);
        res.status(500).json({ error: 'Boost failed', message: err.message });
    }
}
