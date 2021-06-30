/* eslint-disable linebreak-style */
import React, { useState } from 'react';
import {
  Modal, Input, Typography,
} from 'antd';
import { useHistory } from 'react-router-dom';

const { Text, Title } = Typography;

function PlayModal(props) {
  const {
    selectVisible, setSelectVisible, client, code, setCode, address, setSettings,
  } = props;
  // const [anon, setAnon] = useState(false);
  const [friendAddress, setFriendAddress] = useState('');

  const history = useHistory();
  return (
    <Modal
      onCancel={() => {
        setSelectVisible(false);
      }}
      onOk={async () => {
        // Subscribe to a stream
        // Here is the event we'll be sending
        const msg = {
          hello: 'world',
          random: Math.random(),
        };

        // Publish the event to the Stream
        await client.publish(code, msg);
        setSettings({
          vsComputer: false,
        });
        if (code !== '' || friendAddress !== '') {
          history.push('/game');
        }
      }}
      visible={selectVisible}
    >
      <Title level={3}>Join a game:</Title>
      <Input
        onChange={async ({ target: { value } }) => {
          setCode(value);
        }}
        placeholder="Enter code"
      />
      <div style={{ marginTop: 20 }} />
      <Title level={3}>Create a game:</Title>
      {/* <Checkbox onChange={({ target: { checked } }) => {
        setAnon(checked);
      }}
      >
        Anonymous
      </Checkbox> */}
      <Input
        onChange={async ({ target: { value } }) => {
          const stream = await client.getOrCreateStream({
            id: `${address}/game`, // or 0x1234567890123456789012345678901234567890/foo/bar or mydomain.eth/foo/bar
          });
          if (!(await stream.hasPermission('stream_get', value))) {
            await stream.grantPermission('stream_get', value);
          }
          if (!(await stream.hasPermission('stream_publish', value))) {
            await stream.grantPermission('stream_publish', value);
          }
          if (!(await stream.hasPermission('stream_subscribe', value))) {
            await stream.grantPermission('stream_subscribe', value);
          }

          setFriendAddress(value);
          setCode(stream);
        }}
        // style={{ marginTop: 10 }}
        // disabled={anon}
        placeholder="Enter friend&apos;s ethreum address"
      />
      <div style={{ marginTop: 10 }}>
        <Text>
          {`Give this code to your friend: ${code.id}`}
        </Text>
      </div>
    </Modal>
  );
}

export default PlayModal;
