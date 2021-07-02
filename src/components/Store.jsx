/* eslint-disable linebreak-style */
import React from 'react';
import { Button } from 'antd';
// import { ethers } from 'ethers';
/* eslint-disable-next-line */
import SVG from 'react-inlinesvg';
import buildAHorse from '../randomHorse';

function Store(props) {
  const { provider } = props;
  console.log(provider);
  const horse = buildAHorse(Math.random());
  const horse2 = buildAHorse(Math.random());
  const horse3 = buildAHorse(Math.random());
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
      <Button>Mint a piece</Button>
    </div>
  );
}

export default Store;
