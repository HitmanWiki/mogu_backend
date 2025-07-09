// api/inventory.js
import fetch from 'node-fetch';

const NFT_CONTRACT = "0x3265d34e9d04cce9bc30d1c012636d76959be6a7".toLowerCase();

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'POST');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { wallet } = req.body;
    if (!wallet) {
        return res.status(400).json({ error: "Wallet address is required" });
    }

    try {
        const url = `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}/getNFTsForOwner?owner=${wallet}&contractAddresses[]=${NFT_CONTRACT}`;
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

        return res.status(200).json({ nfts: ownedNFTs });
    } catch (err) {
        console.error("Error fetching NFTs:", err);
        return res.status(500).json({ error: "Failed to fetch NFTs" });
    }
}
