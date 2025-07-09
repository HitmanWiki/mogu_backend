import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import stakingAbi from './abis/stakingAbi.json' assert { type: "json" };
import { ethers } from 'ethers';


dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
const PORT = 5001;

const STAKING_CONTRACT = process.env.STAKING_CONTRACT;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const NFT_CONTRACT = "0x3265d34e9d04cce9bc30d1c012636d76959be6a7".toLowerCase();



// Initialize ethers.js provider/signer
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const stakingContract = new ethers.Contract(STAKING_CONTRACT, stakingAbi, wallet);

// ---- Route #1: Boost Setter ----
app.post('/api/setBoost', async (req, res) => {
    const { user, boost } = req.body;

    if (!user || boost === undefined) {
        return res.status(400).json({ error: 'Missing user or boost' });
    }

    try {
        const tx = await stakingContract.setUserBoostApy(user, boost);
        await tx.wait();
        res.json({ success: true, txHash: tx.hash });
    } catch (error) {
        console.error('Error setting boost:', error);
        res.status(500).json({ error: 'Failed to set boost' });
    }
});

// ---- Route #2: Inventory Fetcher ----
app.post('/api/inventory', async (req, res) => {
    const { wallet } = req.body;

    if (!wallet) return res.status(400).json({ error: "Wallet address is required" });

    try {
        const url = `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${wallet}&contractAddresses[]=${NFT_CONTRACT}`;

        const response = await fetch(url);
        const data = await response.json();

        const ownedNFTs = data.ownedNfts.filter(nft =>
            nft.contract.address.toLowerCase() === NFT_CONTRACT
        ).map(nft => ({
            tokenId: nft.id.tokenId,
            name: nft.title,
            image: nft.media?.[0]?.gateway,
            metadata: nft.metadata,
        }));

        res.json({ nfts: ownedNFTs });
    } catch (err) {
        console.error("Error fetching NFTs:", err);
        res.status(500).json({ error: "Failed to fetch NFTs" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 MOGU Backend running on http://localhost:${PORT}`);
});
