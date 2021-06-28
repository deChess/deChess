/* eslint-disable */
import React, { useState } from 'react';
import { Menu } from 'antd';
import {
  Link,
} from 'react-router-dom';

const StreamrClient = require('streamr-client');

function NavBar(props) {
  const { setAccount } = props;
  const { ethereum } = window;
  const [address, setAddress] = useState('');

  return (
    <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['play']}>
      <Menu.Item key="play"><Link to="/play">Play</Link></Menu.Item>
      <Menu.Item key="NFTs"><Link to="/store">Store</Link></Menu.Item>
      <Menu.Item
        onClick={async () => {
          if (!ethereum) {
            setAddress('no wallet detected');
            return;
          }
          const client = await new StreamrClient({
            // restUrl: 'http://localhost/api/v1', // if you want to test locally in the streamr-docker-dev environment
            auth: { ethereum },
            publishWithSignature: 'never',
          });
          setAccount(client);
          setAddress(ethereum.selectedAddress);
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
