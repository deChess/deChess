/* eslint-disable linebreak-style */
import React, { useState, useEffect } from 'react';
import Layout, { Content, Footer, Header } from 'antd/lib/layout/layout';
import {
  Switch,
  Route,
  Redirect,
  useLocation,
} from 'react-router-dom';
import IPFS from 'ipfs-core';
import ChessBoard from './components/Chessboard';
import MainMenu from './components/MainMenu';
import NavBar from './components/NavBar';
import Store from './components/Store';
import 'antd/dist/antd.css';
import './App.css';

function App() {
  const [settings, setSettings] = useState({ vsComputer: false });
  const [code, setCode] = useState('');
  const [client, setClient] = useState();
  const [address, setAddress] = useState('');
  const [provider, setProvider] = useState();
  const [ipfs, setIpfs] = useState();
  useEffect(async () => {
    setIpfs(await IPFS.create());
  }, []);
  return (
    <Layout>
      {useLocation().pathname !== '/game' && (
        <Header>
          <NavBar
            address={address}
            setAddress={setAddress}
            setClient={setClient}
            setProvider={setProvider}
          />
        </Header>
      )}
      <Switch>
        <Route exact path="/">
          <Redirect to="/play" />
        </Route>
        <Route path="/store">
          <Content style={{
            height: '1500px',
            background: '#2b313c',
          }}
          >
            <Store ipfs={ipfs} provider={provider} />
          </Content>
        </Route>
        <Route path="/play">
          <Content style={{
            height: 'calc(100vh - 70px - 64px)',
            background: '#2b313c',
          }}
          >
            <MainMenu
              address={address}
              code={code}
              setCode={setCode}
              client={client}
              setSettings={setSettings}
            />
          </Content>
        </Route>
        <Route path="/game">
          <ChessBoard code={code} client={client} settings={settings} />
        </Route>

        <Route path="/404">
          <div>404 not found</div>
        </Route>
        <Redirect to="/404" />
      </Switch>
      {useLocation().pathname !== '/game' && <Footer>Made with &#10084;&#65039;</Footer>}
    </Layout>
  );
}

export default App;
