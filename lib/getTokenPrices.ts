import axios from 'axios';

async function getTokenPrices(tokens: { mint: string; name: string; logoURI: string; amount: number; decimals: number }[]) : Promise<{
    symbol: string;
    tokenAccount: string;
    programId: string; mint: string; name: string; logoURI: string; amount: number; priceInUSD: number; totalValueInUSD: number; decimals: number 
}[]> {
    try {
        // Extract mint addresses directly inside this function
        const tokenMints = tokens.map((token) => token.mint).join(','); // Join mints by comma

        // Fetch prices from Jupiter Price API for these token mints (vsToken is USDC by default)
        const response = await axios.get(`https://lite-api.jup.ag/price/v2?ids=JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN,So11111111111111111111111111111111111111112`);

        const priceData = response.data.data;

        if (!priceData) {
            throw new Error('Invalid response from Jupiter API');
        }

        // Map each token to its corresponding price and total value in USD
        return tokens.map((token) => {
            const price = priceData[token.mint]?.price || 0; // Safely handle missing prices
            return {
                ...token,
                priceInUSD: price,
                totalValueInUSD: token.amount * price, // Calculate total value in USD
            };
        });
    } catch (error) {
        console.error('Error fetching token prices:', error);
        throw error;
    }
}

export default getTokenPrices;