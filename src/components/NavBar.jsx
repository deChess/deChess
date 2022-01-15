/* eslint-disable linebreak-style */
/* eslint-disable no-empty */
/* eslint-disable no-console */

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
  let currentAccount = null;

  // For now, 'eth_accounts' will continue to always return an array
  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
    } else if (accounts[0] !== currentAccount) {
      [currentAccount] = accounts;
      setAddress(currentAccount);
    }
  }

  // Note that this event is emitted on page load.
  // If the array of accounts is non-empty, you're already
  // connected.
  ethereum.on('accountsChanged', handleAccountsChanged);

  return (
    <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['play']}>
      <Menu.Item key="play"><Link to="/play">Play</Link></Menu.Item>
      { /* <Menu.Item key="store"><Link to="/store">Store</Link></Menu.Item> */ }
      <Menu.Item key="collection"><Link to="/collection">Collection</Link></Menu.Item>
      <Menu.Item key="minter"><Link to="/minter">Minter</Link></Menu.Item>
      <Menu.Item
        onClick={async () => {
          if (window.ethereum) {
            try {
              await window.ethereum.request({ method: 'eth_requestAccounts' }).then(handleAccountsChanged);
              setAddress(currentAccount);
              const provider = new ethers.providers.Web3Provider(ethereum);
              provider.getSigner();
              setProvider(provider);
              const client = await new StreamrClient({
                // restUrl: 'http://localhost/api/v1', // if you want to test locally in the streamr-docker-dev environment
                auth: { ethereum },
                publishWithSignature: 'never',
              });
              setClient(client);
              const ensAddress = await provider.lookupAddress(ethereum.selectedAddress);
              setAddress(ensAddress || currentAccount);
            // eslint-disable-next-line no-console
            } catch (error) { console.log('error connecting to metamask', error); }
          }
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
