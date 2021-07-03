/* eslint-disable linebreak-style */
import React from 'react';
import { Button } from 'antd';
import { ethers } from 'ethers';
import SVG from 'react-inlinesvg';
import pinataSDK from '@pinata/sdk';
import buildAHorse from '../randomHorse';
import ERC721Rarible from '../ERC721Rarible.json';

const pinata = pinataSDK(process.env.REACT_APP_PINIATA_KEY, process.env.REACT_APP_PINIATA_SECRET);

const contractAddress = '0x6ede7f3c26975aad32a475e1021d8f6f39c89d82';

function Store(props) {
  const { provider, ipfs } = props;
  const signer = provider.getSigner();
  const horse = buildAHorse(Math.random());
  const horse2 = buildAHorse(Math.random());
  const horse3 = buildAHorse(Math.random());

  const mint = async () => {
    const selectedAddress = await signer.getAddress();
    const tokenId = await fetch(`https://api-staging.rarible.com/protocol/v0.1/ethereum/nft/collections/${contractAddress}/generate_token_id?minter=${selectedAddress}`);
    const contract = new ethers.Contract(contractAddress, ERC721Rarible.abi, signer);
    const horseToMint = buildAHorse(Math.random());
    const ipfsHorseUpload = await ipfs.add(horseToMint);
    pinata.pinByHash(ipfsHorseUpload.path);
    const metaData = await ipfs.add(JSON.stringify({
      description: 'metadata for chess piece',
      external_url: 'dechess.nft',
      image: `ipfs://ipfs/${ipfsHorseUpload.path}`,
      name: 'Chess Piece Horse',
      attributes: { hair: 'blue' },
    }));
    pinata.pinByHash(metaData.path);
    const tokenIdJSON = await tokenId.json();
    const tx = await contract.mintAndTransfer(
      [
        tokenIdJSON.tokenId,
        `/ipfs/${metaData.path}`,
        [[selectedAddress, 10000]], // You can assign creators, but the value must
        [], // Royalties are set as basis, so 1000 = 10%.
        ['0x'],
      ],
      selectedAddress,
    );
    await tx.wait();
  };
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around',
    }}
    >
      <div style={{ display: 'flex' }}>
        <SVG height={400} src={horse} />
        <SVG height={400} src={horse2} />
        <SVG height={400} src={horse3} />
      </div>
      <Button onClick={mint}>Mint a piece</Button>
    </div>
  );
}

export default Store;
