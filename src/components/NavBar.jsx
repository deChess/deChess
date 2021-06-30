/* eslint-disable linebreak-style */
import React from 'react';
import { Menu } from 'antd';
import {
  Link,
} from 'react-router-dom';
import { ethers } from 'ethers';

const StreamrClient = require('streamr-client');

function NavBar(props) {
  const { setClient, address, setAddress } = props;
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
          const provider = new ethers.providers.Web3Provider(ethereum);
          const client = await new StreamrClient({
            // restUrl: 'http://localhost/api/v1', // if you want to test locally in the streamr-docker-dev environment
            auth: { ethereum },
            publishWithSignature: 'never',
          });
          setClient(client);
          const ensAddress = await provider.lookupAddress(ethereum.selectedAddress);
          setAddress(ensAddress || ethereum.selectedAddress);
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
