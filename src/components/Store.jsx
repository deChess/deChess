/* eslint-disable linebreak-style */
import React, { useState } from 'react';
import { Button, Typography } from 'antd';
import { ethers } from 'ethers';
import SVG from 'react-inlinesvg';
import pinataSDK from '@pinata/sdk';
import buildAHorse from '../randomHorse';
import ERC721Rarible from '../ERC721Rarible.json';

const { Title } = Typography;

const pinata = pinataSDK(process.env.REACT_APP_PINIATA_KEY, process.env.REACT_APP_PINIATA_SECRET);

function Store(props) {
  const { provider, ipfs } = props;
  const [transactionHash, setTransactionHash] = useState();
  const horse = buildAHorse(Math.random());
  const horse2 = buildAHorse(Math.random());
  const horse3 = buildAHorse(Math.random());

  const mint = async () => {
    const { name } = await provider.getNetwork();
    const signer = provider.getSigner();
    const selectedAddress = await signer.getAddress();
    let contractAddress;
    let tokenId;
    if (name === 'rinkeby') {
      contractAddress = '0x6ede7f3c26975aad32a475e1021d8f6f39c89d82';
      tokenId = await fetch(`https://api-staging.rarible.com/protocol/v0.1/ethereum/nft/collections/${contractAddress}/generate_token_id?minter=${selectedAddress}`);
    } else if (name === 'homestead') {
      contractAddress = '0xF6793dA657495ffeFF9Ee6350824910Abc21356C';
      tokenId = await fetch(`https://api.rarible.com/protocol/v0.1/ethereum/nft/collections/${contractAddress}/generate_token_id?minter=${selectedAddress}`);
    }

    const contract = new ethers.Contract(contractAddress, ERC721Rarible.abi, signer);
    const horseToMint = buildAHorse(Math.random());
    const ipfsHorseUpload = await ipfs.add(horseToMint.image);
    pinata.pinByHash(ipfsHorseUpload.path);
    const metaData = await ipfs.add(JSON.stringify({
      description: 'metadata for chess piece',
      external_url: 'dechess.nft',
      image: `ipfs://ipfs/${ipfsHorseUpload.path}`,
      name: 'Chess Piece Horse',
      attributes: horseToMint.properties,
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
    setTransactionHash(tx.hash);
    await tx.wait();
  };
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex',
    }}
    >
      <Title level={2} style={{ marginTop: 50, color: 'white' }}>Examples:</Title>
      <div style={{ display: 'flex' }}>
        <SVG width={350} src={horse.image} />
        <SVG width={350} src={horse2.image} />
        <SVG width={350} src={horse3.image} />
      </div>
      <Button style={{ marginTop: 100 }} size="large" onClick={mint}>Mint a piece</Button>
      {transactionHash && <div style={{ color: 'white' }}>{`View transaction on: rinkeby.etherscan.io/tx/${transactionHash}`}</div>}
    </div>
  );
}

export default Store;
