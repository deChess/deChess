import { Button } from 'antd';
import React from 'react';
import 'antd/dist/antd.css';

export default function MainMenu(props) {
  const { setGameStarted, setSettings } = props;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around',
    }}
    >
      <Button
        style={{ minWidth: '150px', width: '40vw' }}
        onClick={() => {
          setSettings({
            vsComputer: false,
          });
          setGameStarted(true);
        }}
      >
        Play with Friend
      </Button>
      <Button
        style={{ minWidth: '150px', marginTop: '-20px', width: '40vw' }}
        onClick={() => {
          setSettings({
            vsComputer: true,
          });
          setGameStarted(true);
        }}
      >
        Play with Computer
      </Button>
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
