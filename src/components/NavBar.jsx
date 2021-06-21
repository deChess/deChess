import React from 'react';
import { Menu } from 'antd';
import { ethers } from 'ethers';
import {
  Link,
} from 'react-router-dom';

function NavBar(props) {
  const { setAccount, account } = props;

  return (
    <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['play']}>
      <Menu.Item key="play"><Link to="/play">Play</Link></Menu.Item>
      <Menu.Item key="NFTs"><Link to="/store">Store</Link></Menu.Item>
      <Menu.Item
        onClick={async () => {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          await provider.send('eth_requestAccounts', []);
          const signer = provider.getSigner();
          setAccount(await signer.getAddress());
        }}
        style={{ position: 'absolute', top: 0, right: 0 }}
        key="Connect"
      >
        {account || 'Connect'}
      </Menu.Item>
    </Menu>
  );
}

export default NavBar;
