/* eslint-disable no-alert */
/* eslint-disable no-console */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/alt-text */
import React, { useState } from 'react';
import moralis from 'moralis';
import axios from 'axios';
import '../styles/minter.css';
import { NFTStorage, File } from 'nft.storage';

moralis.initialize(process.env.REACT_APP_MORALIS_APPLICATION_ID);
moralis.serverURL = process.env.REACT_APP_MORALIS_SERVER_URL;

const MintNFT = (props) => {
  // ----- useState
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  // const [account, setAccount] = useState('');
  const [imageHash, setImageHash] = useState('');
  const [imageUrl, setImageUrl] = useState('upload-image.png');
  const [message, setMessage] = useState('');
  const [pieceColor, setPieceColor] = useState('');
  const [pieceType, setPieceType] = useState('');
  // const [address, setAddress] = useState('Connect');

  const { address } = props;

  const NFTItem = moralis.Object.extend('NFTItem', { /* Instance methods */ }, {
    // eslint-disable-next-line no-shadow
    newNFTItem(fileHash, ContractAddress, txHash, fileName, title, description, uri, metadata) {
      const nft = new NFTItem();
      nft.set('fileHash', fileHash);
      nft.set('title', title);
      nft.set('description', description);
      nft.set('contractAddress', ContractAddress);
      nft.set('txHash', txHash);
      nft.set('fileName', fileName);
      nft.set('uri', uri);
      nft.set('metadata', metadata);
      return nft;
    },
  });

  const doMint = async () => {
    setMessage('Uploading to IPFS!');
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const data = new FormData();
    let fileName = '';
    data.append('file', imageFile, imageFile.name);
    fileName = imageFile.name;

    const client = new NFTStorage({ token: process.env.REACT_APP_NFTSTORAGE_KEY });

    const metadata = await client.store({
      description,
      name: title,
      image: imageFile,
      attributes: {
        color: pieceColor,
        'piece type': pieceType,
      },
    });

    const metadatauri = metadata.url;
    console.log(metadata);
    setMessage('Successfully uploaded to IPFS. Now Minting NFT! Please Wait!');

    const contractAddress = '0x0AEe6e01D4bD12A9D80AA2fa64A2b53093FafDA7';
    const nftporturl = 'https://api.nftport.xyz/mint_nft';
    const mintData = {
      chain: 'polygon',
      contract_address: '0x0aee6e01d4bd12a9d80aa2fa64a2b53093fafda7',
      metadata_uri: metadatauri, // metadatauri,
      mint_to_address: address,
    };
    const resMint = await axios.post(nftporturl, mintData, {
      maxContentLength: 'Infinity',
      headers: { 'Content-Type': 'application/json', Authorization: 'c0d1ad1d-c062-4e4e-be42-983a11cc044e' },
    });
    console.log(resMint.data);
    const tokenurl = `https://api.nftport.xyz/get_minted_nft?chain=polygon&transaction_hash=${resMint.data.transaction_hash}`;
    const resToken = await axios.get(tokenurl, { headers: { 'Content-Type': 'application/json', Authorization: 'c0d1ad1d-c062-4e4e-be42-983a11cc044e' } });
    console.log(resToken.data);
    // eslint-disable-next-line spaced-comment
    const item = NFTItem.newNFTItem(metadatauri, contractAddress, resMint.data.transaction_hash, fileName, title, description, `https://gateway.pinata.cloud/ipfs/${metadatauri}`, metadata);
    item.save();
    setMessage('Minting Complete!');
  };

  const checkMintable = async () => {
    if (title !== '' && description !== '' && address !== 'Connect') {
      doMint();
    } else {
      console.log(title, description, address);
      alert('not mintable, need more info'); // TODO
    }
  };

  const onFileChange = (event) => {
    let reader;
    setImageFile(event.target.files[0]);
    // eslint-disable-next-line prefer-const
    reader = new FileReader();
    // eslint-disable-next-line func-names
    reader.onload = function (e) { setImageUrl(e.target.result); };
    reader.readAsDataURL(event.target.files[0]);
  };

  return (
    <div className="App">
      <br />
      <br />

      <div id="imageDiv">
        <img id="preview" src={imageUrl} />
        <br />
        <br />

      </div>
      <div id="form">
        <span className="label">Title</span>
        <br />
        <input placeholder="Enter Title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        <br />
        <br />
        <span className="label">Description</span>
        <br />
        <input placeholder="Enter Description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
        <br />
        <br />
        <span className="label">Type</span>
        <br />
        <input placeholder="Enter Piece Type" type="text" value={pieceType} onChange={(e) => setPieceType(e.target.value)} />
        <br />
        <br />
        <span className="label">Color</span>
        <br />
        <input placeholder="Enter Piece Color" type="text" value={pieceColor} onChange={(e) => setPieceColor(e.target.value)} />
        <br />
        <br />
        <input type="file" onChange={onFileChange} />
        <br />
        <br />
        <button onClick={(e) => { checkMintable(); }} id="mintButton">Mint</button>
        <br />
        <br />
        <br />
        {message}
        <br />
        <br />
        <div id="loading"><img src="loading.gif" /></div>
      </div>
    </div>
  );
};

export default MintNFT;
