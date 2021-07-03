/* eslint-disable linebreak-style */
import React, { useState } from 'react';
import {
  Modal, Input, Typography, Alert,
} from 'antd';
import { useHistory } from 'react-router-dom';

const { Title } = Typography;

function CreateModal(props) {
  const {
    joinVisible, setJoinVisible, client, code, setCode, setSettings,
  } = props;
  // const [anon, setAnon] = useState(false);
  const [wrongCode, setWrongCode] = useState(false);

  const history = useHistory();
  return (
    <Modal
      onCancel={() => {
        setJoinVisible(false);
      }}
      onOk={async () => {
        if (client) {
        // Subscribe to a stream
        // Here is the event we'll be sending
          const msg = {
            hello: 'world',
          };

          // Publish the event to the Stream
          try {
            await client.publish(code, msg);
            setSettings({
              vsComputer: false,
            });
            if (code !== '') {
              history.push('/game');
            }
          } catch (err) {
            setWrongCode(true);
          }
        } else {
          setJoinVisible(false);
        }
      }}
      visible={joinVisible}
    >
      <Title level={3}>Join a game:</Title>
      {client ? (
        <Input
          onChange={async ({ target: { value } }) => {
            setCode(value);
          }}
          placeholder="Enter code"
        />
      ) : <Alert type="error" message="Please login on the top right first" />}
      {wrongCode && <Alert type="error" message="Invalid code" />}
      <div style={{ marginTop: 20 }} />
    </Modal>
  );
}

export default CreateModal;
