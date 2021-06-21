import React, { useState } from 'react';
import Layout, { Content, Footer, Header } from 'antd/lib/layout/layout';
import { Menu } from 'antd';
import ChessBoard from './components/Chessboard';
import MainMenu from './components/Menu';
import 'antd/dist/antd.css';
import './App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [settings, setSettings] = useState({ vsComputer: false });
  const [page, setPage] = useState('play');

  return (
    <div>
      <Layout>
        {!gameStarted && (
        <Header>
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['play']}>
            <Menu.Item onClick={() => setPage('play')} key="play">play</Menu.Item>
            <Menu.Item onClick={() => setPage('NFTs')} key="NFTs">NFTs</Menu.Item>
          </Menu>
        </Header>
        )}
        {!gameStarted && (
        <Content style={{
          height: 'calc(100vh - 70px - 64px)',
          background: '#2b313c',
        }}
        >
          {page === 'play' && <MainMenu setSettings={setSettings} setGameStarted={setGameStarted} />}
        </Content>
        )}
        {gameStarted && <ChessBoard settings={settings} />}
        {!gameStarted && <Footer>Made with &#10084;&#65039;</Footer>}
      </Layout>
    </div>
  );
}

export default App;
