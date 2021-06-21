import React, { useState } from 'react';
import {
  Modal, Input, Checkbox, Typography,
} from 'antd';

const { Text } = Typography;

function PlayModal(props) {
  const { selectVisible, setSelectVisible } = props;
  const [anon, setAnon] = useState(false);
  const [friendAddress, setFriendAddress] = useState('');

  return (
    <Modal
      onCancel={() => {
        setSelectVisible(false);
      }}
      visible={selectVisible}
    >

      <Checkbox onChange={({ target: { checked } }) => {
        setAnon(checked);
      }}
      >
        Anonymous
      </Checkbox>
      <Input
        onChange={({ target: { value } }) => {
          setFriendAddress(value);
        }}
        style={{ marginTop: 10 }}
        disabled={anon}
        placeholder="Enter friend&apos;s ethreum address"
      />
      <div style={{ marginTop: 10 }}>
        <Text>
          {`Give this URL to your friend: ${window.location.href.replace(window.location.hash, '')}#/game/${btoa(`${friendAddress}[insert p2p info]`)}`}
        </Text>
      </div>
    </Modal>
  );
}

export default PlayModal;
