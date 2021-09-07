/* eslint-disable */
/* eslint-disable linebreak-style */
import React, { useState } from 'react';
import { Button } from 'antd';
import { ethers } from 'ethers';
// eslint-disable-next-line import/no-unresolved
import pinataSDK from '@pinata/sdk';
import buildAHorse from '../randomHorse';
import ERC721Rarible from '../ERC721Rarible.json';
import moralis from "moralis";
import Web3 from "web3";

const pinata = pinataSDK(process.env.REACT_APP_PINIATA_KEY, process.env.REACT_APP_PINIATA_SECRET);

function Collection(props) {
  moralis.initialize('8X72obW9xkhxyvk00BuQuJBR1R60KfxrtHIBJdAJ');
  moralis.serverURL = "https://dytrxturshw9.moralis.io:2053/server";
  async function getNFTsFromChain() {
    const options = { chain: 'mumbai', address: '0x14a89b696ced1ca0e94956485290739db74cdb07' };
    const NFTs = await moralis.Web3.getNFTs(options);
    console.log(NFTs);
    return NFTs
  }
  getNFTsFromChain();
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex',
    }}
    >
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
    </div>
  );
}

export default Collection;
