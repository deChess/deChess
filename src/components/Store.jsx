/* eslint-disable linebreak-style */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
/* eslint-disable eqeqeq */
import React, { useState } from 'react';
import { Button, Typography } from 'antd';
import { ethers } from 'ethers';
import SVG from 'react-inlinesvg';
import pinataSDK from '@pinata/sdk';
import buildAHorse from '../randomHorse';
import ERC721Rarible from '../ERC721Rarible.json';
import VRF from '../VRF.json';
import controller from '../controller.json';
import gammaAbi from '../gamma.json';
import blackKingImage from '../images/pieces/hackmoney/bK.svg';
import blackHorseImage from '../images/pieces/hackmoney/bN.svg';
import blackQueenImage from '../images/pieces/hackmoney/bQ.svg';
import whiteKingImage from '../images/pieces/hackmoney/wK.svg';
import whiteHorseImage from '../images/pieces/hackmoney/wN.svg';
import whiteQueenImage from '../images/pieces/hackmoney/wQ.svg';

const { Title } = Typography;

const pinata = pinataSDK(process.env.REACT_APP_PINIATA_KEY, process.env.REACT_APP_PINIATA_SECRET);
const timer = (ms) => new Promise((res) => setTimeout(res, ms));
function Store(props) {
  const { provider, ipfs } = props;
  const [transactionHash, setTransactionHash] = useState();
  const [loading, setLoading] = useState();
  const horse = buildAHorse(Math.random());
  const horse2 = buildAHorse(Math.random());
  const horse3 = buildAHorse(Math.random());
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
    } else if (name === 'maticmum') {
      contractAddress = '0x22a54F943033528f670258CDc68839CC533aAe1c';
    }

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
    if (name !== 'maticmum') {
      const tokenIdJSON = await tokenId.json();
      const contract = new ethers.Contract(contractAddress, ERC721Rarible.abi, signer);
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
      setTransactionHash(name === 'rinkeby' ? `rinkeby.etherscan.com/tx/${tx.hash}` : `etherscan.com/tx/${tx.hash}`);
      await tx.wait();
    } else {
      const contract = new ethers.Contract(contractAddress, controller, signer);
      await contract.mint(0, `ipfs://ipfs/${metaData.path}`, 1, selectedAddress, 0, [], []);

      const gamma = contract.gamma();
      const gammaContract = new ethers.Contract(gamma, gammaAbi, signer);
      const gammaTokenId = BigInt(await gammaContract.totalSupply());
      const gammaTx = await gammaContract.purchase(gammaTokenId);
      setTransactionHash(`mumbai.polygonscan.com/tx/${gammaTx.hash}`);
      await gammaTx.wait();
    }
  };

  /* function mintAnNFTTest(chain, contractAddress, metadataUri, mintToAddress) {
    fetch('https://api.nftport.xyz/mint_nft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'c0d1ad1d-c062-4e4e-be42-983a11cc044e',
      },
      body: `{"chain":"${chain}",
      "contract_address":"${contractAddress}",
      "metadata_uri":"${metadataUri}",
      "mint_to_address":"${mintToAddress}"}`,
    })
      .then((response) => {
        // eslint-disable-next-line no-console
        console.log(response);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(err);
      });
  } */

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
      <Title style={{ color: 'white', marginTop: '50px' }}>Examples of random horse:</Title>
      <div style={{ display: 'flex' }}>
        <SVG width={350} src={horse.image} />
        <SVG width={350} src={horse2.image} />
        <SVG width={350} src={horse3.image} />
      </div>
      <Button
        style={{ marginTop: 100 }}
        size="large"
        onClick={async () => {
          const { name } = await provider.getNetwork();
          let VRFContractAddress;
          let randomNumber;
          if (name === 'maticmum') {
            VRFContractAddress = '0xf8B00745E4108eC18ee3a97f304F49af2C367EdA';
            const signer = provider.getSigner();
            const priceFeedInstance = new ethers.Contract(
              VRFContractAddress, VRF, signer,
            );
            const oldResult = BigInt(await priceFeedInstance.randomResult());
            let result = BigInt(await priceFeedInstance.randomResult());
            await priceFeedInstance.getRandomNumber();
            setLoading('Loading...');
            while (result === oldResult) {
              result = BigInt(await priceFeedInstance.randomResult());
              await timer(3000);
            }
            setLoading(null);
            randomNumber = result;
          } else {
            randomNumber = Math.random();
          }
          const randoHorse = buildAHorse(randomNumber);
          mint(randoHorse.image, randoHorse.properties);
        }}
      >
        Mint a random horse piece

      </Button>
      {transactionHash && <div style={{ color: 'white' }}>{`View transaction on: ${transactionHash}`}</div>}
      {loading && <div style={{ color: 'white' }}>{loading}</div>}
    </div>
  );
}

export default Store;
