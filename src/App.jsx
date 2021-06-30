/* eslint-disable */
import React, { useState } from 'react';
import Layout, { Content, Footer, Header } from 'antd/lib/layout/layout';
import {
  Switch,
  Route,
  Redirect,
  useLocation,
} from 'react-router-dom';
import ChessBoard from './components/Chessboard';
import MainMenu from './components/MainMenu';
import NavBar from './components/NavBar';
import 'antd/dist/antd.css';
import './App.css';

function App() {
  const [settings, setSettings] = useState({ vsComputer: false });
  const [code, setCode] = useState('');
  const [client, setClient] = useState();
  const [address, setAddress] = useState('');

  return (
    <Layout>
      {useLocation().pathname !== '/game' && (
        <Header>
          <NavBar address={address} setAddress={setAddress} setClient={setClient} />
        </Header>
      )}
      <Switch>
        <Route exact path="/">
          <Redirect to="/play" />
        </Route>
        <Route path="/store">
          <Content style={{
            height: 'calc(100vh - 70px - 64px)',
            background: '#2b313c',
          }}
          >
            <div>Store Stuff</div>
          </Content>
        </Route>
        <Route path="/play">
          <Content style={{
            height: 'calc(100vh - 70px - 64px)',
            background: '#2b313c',
          }}
          >
            <MainMenu address={address} code={code} setCode={setCode} client={client} setSettings={setSettings} />
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