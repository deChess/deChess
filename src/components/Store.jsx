/* eslint-disable linebreak-style */
import React, { useState } from 'react';
import { Button } from 'antd';
import { ethers } from 'ethers';
import SVG from 'react-inlinesvg';
import pinataSDK from '@pinata/sdk';
import buildAHorse from '../randomHorse';
import ERC721Rarible from '../ERC721Rarible.json';
import blackKingImage from '../images/pieces/hackmoney/bK.svg';
import blackHorseImage from '../images/pieces/hackmoney/bN.svg';
import blackQueenImage from '../images/pieces/hackmoney/bQ.svg';
import whiteKingImage from '../images/pieces/hackmoney/wK.svg';
import whiteHorseImage from '../images/pieces/hackmoney/wN.svg';
import whiteQueenImage from '../images/pieces/hackmoney/wQ.svg';

const pinata = pinataSDK(process.env.REACT_APP_PINIATA_KEY, process.env.REACT_APP_PINIATA_SECRET);

function Store(props) {
  const { provider, ipfs } = props;
  const [transactionHash, setTransactionHash] = useState();

  const mint = async (svg, properties) => {
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
    const ipfsHorseUpload = await ipfs.add(svg);
    pinata.pinByHash(ipfsHorseUpload.path);
    const metaData = await ipfs.add(JSON.stringify({
      description: 'chess piece for dechess',
      external_url: 'dechess.nft',
      image: `ipfs://ipfs/${ipfsHorseUpload.path}`,
      name: `Chess Piece ${properties['piece type']}`,
      attributes: properties,
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
      <div style={{ display: 'flex' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SVG width={350} src={blackKingImage} />
          <Button
            onClick={async () => {
              const response = await fetch(blackKingImage);
              const text = await response.text();
              mint(text, {
                'piece type': 'king',
                color: 'black',
              });
            }}
          >
            Mint
          </Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SVG width={350} src={blackHorseImage} />
          <Button
            onClick={async () => {
              const response = await fetch(blackHorseImage);
              const text = await response.text();
              mint(text, {
                'piece type': 'knight',
                color: '#FF007A',
                'ear type': 0,
                'hair type': 0,
                'has horn': 'yes',
              });
            }}
          >
            Mint
          </Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SVG width={350} src={blackQueenImage} />
          <Button
            onClick={async () => {
              const response = await fetch(blackQueenImage);
              const text = await response.text();
              mint(text, {
                'piece type': 'queen',
                color: 'black',
              });
            }}
          >
            Mint
          </Button>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SVG width={350} src={whiteKingImage} />
          <Button
            onClick={async () => {
              const response = await fetch(whiteKingImage);
              const text = await response.text();
              mint(text, {
                'piece type': 'king',
                color: 'white',
              });
            }}
          >
            Mint
          </Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SVG width={350} src={whiteHorseImage} />
          <Button
            onClick={async () => {
              const response = await fetch(whiteHorseImage);
              const text = await response.text();
              mint(text, {
                'piece type': 'knight',
                color: '#FF007A',
                'ear type': 0,
                'hair type': 0,
                'has horn': 'yes',
              });
            }}
          >
            Mint
          </Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SVG width={350} src={whiteQueenImage} />
          <Button
            onClick={async () => {
              const response = await fetch(whiteQueenImage);
              const text = await response.text();
              mint(text, {
                'piece type': 'queen',
                color: 'white',
              });
            }}
          >
            Mint
          </Button>
        </div>
      </div>
      <Button
        style={{ marginTop: 100 }}
        size="large"
        onClick={() => {
          const randoHorse = buildAHorse(Math.random());
          mint(randoHorse.image, randoHorse.properties);
        }}
      >
        Mint a random horse piece

      </Button>
      {transactionHash && <div style={{ color: 'white' }}>{`View transaction on: rinkeby.etherscan.io/tx/${transactionHash}`}</div>}
    </div>
  );
}

export default Store;
