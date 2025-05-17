import axios from 'axios';

async function getTokenPrices(tokens: { mint: string; name: string; logoURI: string; amount: number; decimals: number }[]): Promise<{
    symbol: string;
    tokenAccount: string;
    programId: string; 
    mint: string; 
    name: string; 
    logoURI: string; 
    amount: number; 
    priceInUSD: number; 
    totalValueInUSD: number; 
    decimals: number 
}[]> {
    try {
        // Extract mint addresses directly inside this function
        const tokenMints = tokens.map((token) => token.mint).join(','); // Join mints by comma

        // Fetch prices from Jupiter Price API for these token mints (vsToken is USDC by default)
        const response = await axios.get(`https://lite-api.jup.ag/price/v2?ids=${tokenMints}`);

        const priceData = response.data.data;

        if (!priceData) {
            throw new Error('Invalid response from Jupiter API');
        }

        // Add the missing properties to match the return type
        return tokens.map((token) => {
            const price = priceData[token.mint]?.price || 0; // Safely handle missing prices
            return {
                ...token,
                symbol: '', // Add missing property
                tokenAccount: '', // Add missing property
                programId: '', // Add missing property
                priceInUSD: price,
                totalValueInUSD: token.amount * price, // Calculate total value in USD
            };
        });
    } catch (error) {
        console.error('Error fetching token prices:', error);
        throw error; // This will propagate the error to the caller
    }
}

export default getTokenPrices;