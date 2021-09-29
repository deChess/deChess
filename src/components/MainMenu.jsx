/* eslint-disable linebreak-style */
import { Button } from 'antd';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CreateModal from './CreateModal';
import JoinModal from './JoinModal';

const clockTime = 600000;

export default function MainMenu(props) {
  const {
    setSettings, client, code, setCode, address,
  } = props;
  const [createVisible, setCreateVisible] = useState(false);
  const [joinVisible, setJoinVisible] = useState(false);

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around',
    }}
    >
      <Button
        style={{ minWidth: '150px', width: '40vw' }}
        onClick={() => {
          setCreateVisible(true);
        }}
      >
        Create a game
      </Button>
      <Button
        style={{ minWidth: '150px', width: '40vw' }}
        onClick={() => {
          setJoinVisible(true);
        }}
      >
        Join a game
      </Button>
      <Button
        style={{ minWidth: '150px', width: '40vw' }}
        onClick={() => {
          setSettings({
            vsComputer: true,
            startColor: 'white',
            black: { address: 'computer', time: clockTime },
            white: { address, time: clockTime },
          });
        }}
      >
        <Link to="/game">Play with Computer</Link>
      </Button>
      <CreateModal
        createVisible={createVisible}
        setCreateVisible={setCreateVisible}
        setSettings={setSettings}
        client={client}
        code={code}
        setCode={setCode}
        address={address}
      />
      <JoinModal
        joinVisible={joinVisible}
        setJoinVisible={setJoinVisible}
        setSettings={setSettings}
        client={client}
        code={code}
        setCode={setCode}
        address={address}
      />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
  );
}
