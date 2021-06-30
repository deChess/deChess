/* eslint-disable linebreak-style */
import React, { useState } from 'react';
import {
  Modal, Input, Typography, Alert,
} from 'antd';
import { useHistory } from 'react-router-dom';
import { ethers } from 'ethers';

const { Title } = Typography;

function CreateModal(props) {
  const {
    createVisible, setCreateVisible, client, code, setCode, address, setSettings,
  } = props;
  // const [anon, setAnon] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [friendAddress, setFriendAddress] = useState('');

  const history = useHistory();
  return (
    <Modal
      onCancel={() => {
        setCreateVisible(false);
      }}
      onOk={async () => {
        if (client) {
          if (!code.id) {
            setProcessing(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            let ensDecoded = await provider.resolveName(friendAddress);
            if (!ensDecoded) {
              ensDecoded = friendAddress;
            }
            try {
              const stream = await client.getOrCreateStream({
                id: `${address}/game`, // or 0x1234567890123456789012345678901234567890/foo/bar or mydomain.eth/foo/bar
              });
              if (!(await stream.hasPermission('stream_get', ensDecoded))) {
                await stream.grantPermission('stream_get', ensDecoded);
              }
              if (!(await stream.hasPermission('stream_publish', ensDecoded))) {
                await stream.grantPermission('stream_publish', ensDecoded);
              }
              if (!(await stream.hasPermission('stream_subscribe', ensDecoded))) {
                await stream.grantPermission('stream_subscribe', ensDecoded);
              }
              setCode(stream);
            } catch (err) {
              setCode(' ');
            }

            setProcessing(false);
          } else {
            const msg = {
              hello: 'world',
              random: Math.random(),
            };

            // Publish the event to the Stream
            await client.publish(code, msg);
            setSettings({
              vsComputer: false,
            });
            if (code !== '') {
              history.push('/game');
            }
          }
        } else {
          setCreateVisible(false);
        }
      }}
      visible={createVisible}
    >
      <Title level={3}>Create a game:</Title>
      {/* <Checkbox onChange={({ target: { checked } }) => {
        setAnon(checked);
      }}
      >
        Anonymous
      </Checkbox> */}
      {client ? (
        <Input
          onChange={async ({ target: { value } }) => {
            setFriendAddress(value);
          }}
        // style={{ marginTop: 10 }}
        // disabled={anon}
          placeholder="Enter friend&apos;s ethreum address"
        />
      ) : (<Alert type="error" message="Please login on the top right first" />)}
      <div style={{ marginTop: 10 }}>
        {code !== '' && (code.id ? <Alert type="success" message={`Give this code to your friend: "${code.id}" then press OK again to start`} />
          : (processing ? <Alert message="Processing..." /> : <Alert type="error" message="Invalid address" />))}
      </div>
    </Modal>
  );
}

export default CreateModal;
