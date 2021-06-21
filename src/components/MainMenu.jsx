import { Button } from 'antd';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PlayModal from './PlayModal';

export default function MainMenu(props) {
  const { setSettings } = props;
  const [selectVisible, setSelectVisible] = useState(false);

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around',
    }}
    >
      <Button
        style={{ minWidth: '150px', width: '40vw' }}
        onClick={() => {
          setSelectVisible(true);
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
        }}
      >
        <Link to="/game">Play with Computer</Link>
      </Button>
      <PlayModal
        selectVisible={selectVisible}
        setSelectVisible={setSelectVisible}
        setSettings={setSettings}
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
