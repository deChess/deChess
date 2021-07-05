/* eslint-disable linebreak-style */
/* eslint-disable no-empty */
import React from 'react';
import { Menu } from 'antd';
import {
  Link,
} from 'react-router-dom';
import { ethers } from 'ethers';

const StreamrClient = require('streamr-client');

function NavBar(props) {
  const {
    setClient, address, setAddress, setProvider,
  } = props;
  const { ethereum } = window;

  return (
    <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['play']}>
      <Menu.Item key="play"><Link to="/play">Play</Link></Menu.Item>
      <Menu.Item key="store"><Link to="/store">Store</Link></Menu.Item>
      <Menu.Item key="collection"><Link to="/collection">Collection</Link></Menu.Item>
      <Menu.Item
        onClick={async () => {
          if (!ethereum) {
            setAddress('no wallet detected');
            return;
          }
          if (!ethereum.selectedAddress) {
            setAddress('wallet not signed in');
            return;
          }
          await window.ethereum.enable();
          const provider = new ethers.providers.Web3Provider(ethereum);
          provider.getSigner();
          await provider.send('eth_requestAccounts', []);
          const client = await new StreamrClient({
            // restUrl: 'http://localhost/api/v1', // if you want to test locally in the streamr-docker-dev environment
            auth: { ethereum },
            publishWithSignature: 'never',
          });
          setClient(client);
          let ensAddress;
          try {
            ensAddress = await provider.lookupAddress(ethereum.selectedAddress);
          } catch (err) {
          }
          setAddress(ensAddress || ethereum.selectedAddress);
          setProvider(provider);
        }}
        style={{ position: 'absolute', top: 0, right: 0 }}
        key="Connect"
      >
        {address || 'Connect'}
      </Menu.Item>
    </Menu>
  );
}

export default NavBar;
