import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const ALCHEMY_KEY = process.env.ALCHEMY_KEY;
const NFT_CONTRACT = '0x3265d34e9d04cce9bc30d1c012636d76959be6a7'; // your NFT contract

router.post('/', async (req, res) => {
    const { wallet } = req.body;

    if (!wallet) return res.status(400).json({ error: 'Wallet address is required' });

    try {
        const url = `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_KEY}/getNFTsForOwner?owner=${wallet}&contractAddresses[]=${NFT_CONTRACT}`;

        const response = await fetch(url);
        const data = await response.json();

        const nfts = data.ownedNfts?.map((nft) => ({
            tokenId: nft.id.tokenId,
            name: nft.title,
            image: nft.media?.[0]?.gateway || '',
            metadata: nft.metadata || {},
        })) || [];

        res.json({ nfts });
    } catch (err) {
        console.error('Alchemy fetch error:', err.message);
        res.status(500).json({ error: 'Failed to fetch NFTs' });
    }
});

export default router;
