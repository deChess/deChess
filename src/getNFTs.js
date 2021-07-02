/* eslint-disable no-console */
/* eslint-disable no-plusplus */
/* eslint-disable indent */
const covalentAPIKey = 'ckey_6c3f3233e25f4ad1bfe6cfc2403';
const testAddress = '0x7E379d280AC80BF9e5D5c30578e165e6c690acC9';

const chainIDs = {
    ethereum: 1,
    polygon: 137,
    binance: 56,
    avalanche: 43114,
    fantomOpera: 250,
};

const supportedNetworks = ['ethereum', 'polygon'];

async function getTokensFromChain(network, address) {
    const response = await fetch(`https://api.covalenthq.com/v1/1/address/${address}/balances_v2/?nft=true&key=${covalentAPIKey}`);
    const tokens = await response.json();
    console.log(tokens);
    return tokens;
}

// eslint-disable-next-line no-unused-vars
function getTokens(address) {
    const tokens = {};
    for (let i = 0; i < supportedNetworks.length; i += 1) {
        tokens[supportedNetworks[i]] = getTokensFromChain(chainIDs[supportedNetworks[i]], address);
    }
    return tokens;
}

console.log(getTokens(testAddress));
