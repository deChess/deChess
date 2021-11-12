/* eslint-disable linebreak-style */
import React, { useState } from 'react';
import {
  Modal, Input, Typography, Alert,
} from 'antd';
import { useHistory } from 'react-router-dom';
import { ethers } from 'ethers';

const { Title } = Typography;
const clockTime = 600000;
let currTime = Date.now();
let opponentAddress = '';
let displayedCode = '';

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
            opponentAddress = ensDecoded.toLowerCase();
            try {
              currTime = Date.now();
              displayedCode = `${address}-${currTime}`;
              const stream = await client.createStream({
                // id: `${address}/game`,
                // game ID is starting time of game
                id: `${address}/dechess/game/${currTime}`, // or address/foo/bar or mydomain.eth/foo/bar
              });
              // await stream.addToStorageNode(StorageNode.STREAMR_GERMANY); // store data
              // everyone can get and subscribe to the stream (for spectating)
              if (!(await stream.hasPermission('stream_get', null))) {
                await stream.grantPermission('stream_get', null);
              }
              if (!(await stream.hasPermission('stream_publish', ensDecoded))) {
                await stream.grantPermission('stream_publish', ensDecoded);
              }
              if (!(await stream.hasPermission('stream_subscribe', null))) {
                await stream.grantPermission('stream_subscribe', null);
              }
              setCode(stream);
            } catch (err) {
              setCode(' ');
            }

            setProcessing(false);
          } else {
            const msg = {
              type: 'join',
              from: address,
              color: 'white',
              time: Date.now(),
            };

            // Publish the event to the Stream
            await client.publish(code, msg);
            setSettings({
              vsComputer: false,
              startColor: 'white',
              white: {
                address, time: clockTime, rating: '-', increment: 0,
              },
              black: {
                address: opponentAddress, time: clockTime, rating: '-', increment: 0,
              },
              streamId: `${address}/dechess/game/${currTime}`,
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
          placeholder="Enter friend&apos;s ethereum address"
        />
      ) : (<Alert type="error" message="Please login on the top right first" />)}
      <div style={{ marginTop: 10 }}>
        {code !== '' && (code.id ? <Alert type="success" message={`Give this code to your friend: "${displayedCode}" then press OK again to start`} /> // eslint-disable-line
          : (processing ? <Alert message="Processing..." /> : <Alert type="error" message="Invalid address" />))}
        {' '}
        {' '}
      </div>
    </Modal>
  );
}

export default CreateModal;
