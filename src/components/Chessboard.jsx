/* eslint-disable no-console */
import React, { useState, useEffect /* , Component */ } from 'react';
import {
  Button, Col, Modal, Row,
} from 'antd';
import Chess from 'chess.js';
import Chessground from 'react-chessground';
import 'react-chessground/dist/styles/chessground.css'; // redundant import, but freaks out if i dont import this for whatever reason
import '../styles/chessground.css'; // overwrites previous chessground.css, allows easier/more customizability
import '../styles/chessboard.css'; // this one is for the buttons and text that aren't part of the board
/* import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux'; */
// import { start } from 'ipfs-core/src/components/network';
import queen from '../images/wQ.svg';
import rook from '../images/wR.svg';
import bishop from '../images/wB.svg';
import knight from '../images/wN.svg';
// import Clock from './clock';
// import * as clockActions from '../actions';
/* eslint-disable */ 
import '../App.css';
import { Waku, WakuMessage } from 'js-waku';
import protons from 'protons';

const ContentTopic = `/min-react-js-chat/1/chat/proto`;

const proto = protons(`
message SimpleChatMessage {
  uint64 timestamp = 1;
  string text = 2;
}
`);

let doOnce = true; // this is for knowing when both players have joined, i.e. this becomes false

const home = {
  username: '-', address: '-', elo: '-', time: 600000, turn: true,
}; // centiseconds i.e. 0.01
const opponent = {
  username: '-', address: '-', elo: '-', time: 600000, turn: false,
};

function ChessBoard(props) {
  const [waku, setWaku] = React.useState(undefined);
  const [wakuStatus, setWakuStatus] = React.useState('None');
  const [sendCounter, setSendCounter] = React.useState(0);
  const [messages, setMessages] = React.useState([]);
  // eslint-disable-next-line no-unused-vars
  const { settings: { vsComputer, startColor }, client, code } = props;
  // eslint-disable-next-line no-console
  // console.log(vsComputer);
  // console.log(startColor);
  const [chess] = useState(new Chess());
  const [pendingMove, setPendingMove] = useState();
  const [selectVisible, setSelectVisible] = useState(false);
  const [fen, setFen] = useState('');
  const [lastMove, setLastMove] = useState();
  const [isChecked, setChecked] = useState(false);
  const [viewOnly, setViewOnly] = useState(true);
  const [color, setColor] = useState(startColor);
  // eslint-disable-next-line no-unused-vars
  const [orientation, setOrientation] = useState(startColor);
  
  function updateLog() {
    const game = chess.pgn();
    const gameArr = [];
    const moveStarts = [];
    for (let i = 0; i < game.length; i += 1) {
      if (game[i] === '.') {
        if (i < 10) {
          moveStarts.push(i - 1);
        } else if (i < 100) {
          moveStarts.push(i - 2);
        } else {
          moveStarts.push(i - 3);
        }
      }
    }
    for (let i = 0; i < moveStarts.length; i += 1) {
      if (i + 1 !== moveStarts.length) {
        gameArr.push(game.slice(moveStarts[i], moveStarts[i + 1]));
      } else {
        gameArr.push(game.slice(moveStarts[i]));
      }
    }
    const log = document.getElementById('innerLog');
    log.scrollTop = log.scrollHeight;
    log.innerHTML = `<p>${gameArr.join('</p><p>')}</p>`;
  }

  const formatTime = (msecs) => {
    const tenth = parseInt((msecs / 100) % 10, 10);
    let secs = parseInt((msecs / 1000) % 60, 10);
    let mins = parseInt((msecs / 60000) /* % 60 */, 10); // % 60 if using hours
    // let hours = parseInt((msecs / 3600000), 10);

    // hours = hours < 10 ? `0${hours}` : hours;
    mins = mins < 10 ? `0${mins}` : mins;
    secs = secs < 10 ? `0${secs}` : secs;

    // return `${hours}:${mins}:${secs}.${tenth}`;
    return `${mins}:${secs}.${tenth}`;
  };

  // eslint-disable-next-line no-unused-vars
  const flipBoard = () => (orientation === 'white' ? 'black' : 'white');
  const turnColor = () => (chess.turn() === 'w' ? 'white' : 'black');

  useEffect(() => {
    
    if (doOnce && startColor === 'black') {
      setViewOnly(true);
    }

    if (vsComputer) {
      setViewOnly(false);
    } else {
      client.subscribe({
        stream: code,
      },
      (message) => {
        console.log(message);
        // This function will be called when new messages occur
        if (message.hello !== 'world') {
          if (color !== turnColor()) {
            const { move } = message;
            const { from, to } = move;
            const moves = chess.moves({ verbose: true });
            for (let i = 0, len = moves.length; i < len; i += 1) {
              if (moves[i].flags.indexOf('p') !== -1 && moves[i].from === from) {
                setPendingMove([from, to]);
                setSelectVisible(true);
                return;
              }
            }
            if (chess.move({ from, to, promotion: 'q' })) {
              setFen(chess.fen());
              setLastMove([from, to]);
              setChecked(chess.in_check());
              updateLog();
            }
            setViewOnly(false);
          } else {
            setViewOnly(true);
          }
        } else if (doOnce) { // both players have now joined
          const msg = {
            hello: 'world',
          };

          // Publish the event to the Stream
          client.publish(code, msg);
          if (startColor === 'white') {
            setViewOnly(false); // white gets to play first move
          }
          doOnce = false;
        }
      });
      // eslint-disable-next-line spaced-comment
      /* useEffect(() => {
        const syncClock = setInterval(( => {
          const homeTime = document.getElementById('homeTime');
          const opponentTime = document.getElementById('opponentTime');

        }))
      }
      )*/
    }
    updateLog();
  }, [code, color]);

  // chess clock
  const clockInterval = 200; // use this to change how fast the clock ticks
  useEffect(() => {
    if (!!waku) return;
    if (wakuStatus !== 'None') return;

    setWakuStatus('Starting');

    Waku.create({ bootstrap: true }).then((waku) => {
    setWaku(waku);
    setWakuStatus('Connecting');
    waku.waitForConnectedPeer().then(() => {
    setWakuStatus('Ready');
    });
    });
    }, [waku, wakuStatus]);
  // Need to keep the same reference around to add and delete from relay observer
  const processIncomingMessage = React.useCallback((wakuMessage) => {
    if (!wakuMessage.payload) return;

    const { text, timestamp } = proto.SimpleChatMessage.decode(
    wakuMessage.payload
    );

    const time = new Date();
    time.setTime(timestamp);
    const message = { text, timestamp: time };

    setMessages((currMessages) => {
    return [message].concat(currMessages);
    });
}, []);

React.useEffect(() => {
    if (!waku) return;

    waku.relay.addObserver(processIncomingMessage, [ContentTopic]);

    return function cleanUp() {
    waku.relay.deleteObserver(processIncomingMessage, [ContentTopic]);
    };
}, [waku, wakuStatus, processIncomingMessage]);

const sendMessageOnClick = () => {
    if (wakuStatus !== 'Ready') return;

    sendMessage(`Here is message #${sendCounter}`, new Date(), waku).then(() =>
    console.log('Message sent')
    );

    setSendCounter(sendCounter + 1);
};


function sendMessage(message, timestamp, waku) {
  const time = timestamp.getTime();

  const payload = proto.SimpleChatMessage.encode({
    timestamp: time,
    text: message,
  });

  return WakuMessage.fromBytes(payload, ContentTopic).then((wakuMessage) =>
    waku.relay.send(wakuMessage)
  );
}
  useEffect(() => {
    const start = Date.now();
    const chessClock = setInterval(() => {
      // console.log(turnColor(), startColor, turnColor() === startColor);
      // console.log(`doOnce: ${doOnce}`);
      const homeTime = document.getElementById('homeTime');
      const opponentTime = document.getElementById('opponentTime');
      // console.log(`opponent time: ${opponent.time}, home time: ${home.time}`);
      if (homeTime != null && opponentTime != null && !doOnce) {
        // only change times if both players have joined, and homeTime and opponentTime aren't null
        if (turnColor() === startColor) { // decrease own time if own turn
          home.time -= clockInterval;
          homeTime.innerHTML = formatTime(home.time);
        } else { // decrease opponent time if opponent turn
          opponent.time -= clockInterval;
          opponentTime.innerHTML = formatTime(opponent.time);
        }
      }
    }, clockInterval - (start - Date.now()));
    return () => clearInterval(chessClock);
  });

  const randomMove = () => {
    const moves = chess.moves({ verbose: true });
    const move = moves[Math.floor(Math.random() * moves.length)];
    if (moves.length > 0) {
      chess.move(move.san);
      setFen(chess.fen());
      setLastMove([move.from, move.to]);
      setChecked(chess.in_check());
    }
    setViewOnly(false);
    updateLog();
  };

  const onMove = (from, to) => {
    const moves = chess.moves({ verbose: true });
    for (let i = 0, len = moves.length; i < len; i += 1) {
      if (moves[i].flags.indexOf('p') !== -1 && moves[i].from === from) {
        setPendingMove([from, to]);
        setSelectVisible(true);
        return;
      }
    }
    if (chess.move({ from, to, promotion: 'q' })) {
      setFen(chess.fen());
      setLastMove([from, to]);
      setChecked(chess.in_check());
      setColor(turnColor());
      if (vsComputer) { setTimeout(randomMove, 500); } else {
        client.publish(code, {
          move:
          { from, to, promotion: 'q' },
          fen: chess.fen(),
        });
      }
    }
    updateLog();
  };

  const promotion = (e) => {
    const from = pendingMove[0];
    const to = pendingMove[1];

    chess.move({ from, to, promotion: e });
    setFen(chess.fen());
    setLastMove([from, to]);
    setSelectVisible(false);
    setChecked(chess.in_check());
    setColor(turnColor());
    if (vsComputer) { setTimeout(randomMove, 500); } else {
      client.publish(code, {
        move:
        { from, to, promotion: 'q' },
        fen: chess.fen(),
      });
    }
    updateLog();
  };

  const calcMovable = () => {
    const dests = new Map();
    if (!viewOnly) {
      chess.SQUARES.forEach((s) => {
        const ms = chess.moves({ square: s, verbose: true });
        if (ms.length) dests.set(s, ms.map((m) => m.to));
      });
    }
    return {
      free: false,
      dests,
    };
  };
  

  // change page layout depending on window aspect ratio (| for side-by-side and + for stacked)
  // moves | chessboard | dashboard if > 16:9
  // chessboard | moves + dashboard if < 16:9 and > 1:1
  // moves + chessboard + dashboard if < 1:1
  useEffect(() => {
    function handleResize() {
      // console.log('resized to: ', window.innerWidth, ' by ', window.innerHeight);
      const everything = document.getElementById('everything');
      const moves = document.getElementById('outerLog');
      if (window.innerWidth / 16 >= window.innerHeight / 9) { // > 16:9
        everything.style.backgroundSize = 'cover';
        everything.style.backgroundColor = 'black';
        everything.style.flexDirection = 'row';
        moves.style.flexDirection = 'row';
      } else if (window.innerWidth < window.innerHeight) { // < 1:1
        everything.style.backgroundSize = 'cover';
        everything.style.backgroundColor = 'black';
        everything.style.flexDirection = 'column';
        moves.style.flexDirection = 'row';
      } else { // < 16:9 and > 1:1
        everything.style.backgroundSize = 'cover';
        everything.style.backgroundColor = 'black';
        everything.style.flexDirection = 'column';
        moves.style.flexDirection = 'row';
      }
    }
    window.addEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      background: '#2b313c',
      backgroundSize: '500% 500%',
      height: '100vh',
    }}
    >
      <div styles={{ display: 'flex' }} id="everything">
        {      
          <div styles={{ display: 'flex', backgroundColour: 'black' }} id="outerLog">
          <p style={{
            fontSize: '20px',
            margin: '15px',
            textAlign: 'center',
          }}
          >
            Moves
          </p>
        
          <div styles={{ display: 'flex' }} id="innerLog" />
          <p style={{ margin: '10px', display: 'flex' }} />
        </div>}
        <div styles={{ display: 'flex', backgroundColour: 'black' }} id="chessboard">
          <Row>
            <Col span={12}>
              <div styles={{ display: 'flex', backgroundColour: 'black' }} id="chessboard">
                <Chessground
                  width="88vh"
                  height="88vh"
                  turnColor={turnColor()}
                  movable={calcMovable()}
                  lastMove={lastMove}
                  fen={fen}
                  onMove={onMove}
                  highlight={{
                    flex: 1,
                    check: true,
                    lastMove: true,
                  }}
                  premovable={{
                    enabled: true,
                    showDests: true,
                    castle: true,
                  }}
                  check={isChecked}
                  style={{ margin: '30px' }}
                  orientation={orientation}
                />
              </div>
            </Col>
          </Row>
        </div>
        <div styles={{ display: 'flex', backgroundColour: 'black' }} id="dashboard">
          <div styles={{ display: 'flex' }} className="user">
            <div className="userinfo">
              <div className="username">{home.username}</div>
              <div className="userAddress">{home.address}</div>
              <div className="elo">{home.elo}</div>
            </div>
            <div id="homeTime" className="userTime">{formatTime(home.time)}</div>
          </div>
          <div styles={{ display: 'flex' }} id="buttons">
            <Button style={{ width: '9vw', margin: '10px' }}>offer draw</Button>
            <Button style={{ width: '3vw', margin: '10px' }} onClick={() => setOrientation(flipBoard())}>🔄</Button>
            <Button style={{ width: '9vw', margin: '10px' }}>resign</Button>
          </div>
          <div className="user">
            <div className="userinfo">
              <div className="username">{opponent.username}</div>
              <div className="userAddress">{opponent.address}</div>
              <div className="elo">{opponent.elo}</div>
            </div>
            <div id="opponentTime" className="userTime">{formatTime(opponent.time)}</div>
          </div>
        </div>
        <div id="App">
          <header id="App-header">
            <p>{wakuStatus}</p>
            <input type="text" id="message"></input>
            <button onClick={sendMessageOnClick} disabled={wakuStatus !== 'Ready'}>
            Send Message
            </button>
            <ul>
            {messages.map((msg) => {
                return (
                <li>
                    <p>
                    {msg.timestamp.toString()}: {msg.text}
                    </p>
                </li>
                );
            })}
            </ul>
          </header>
          </div>
      </div>
      <Modal visible={selectVisible} footer={null} closable={false} centered>
        <div style={{ textAlign: 'center', cursor: 'pointer' }}>
          <span role="presentation" onClick={() => promotion('q')}>
            <img src={queen} alt="" style={{ width: 50 }} />
          </span>
          <span role="presentation" onClick={() => promotion('r')}>
            <img src={rook} alt="" style={{ width: 50 }} />
          </span>
          <span role="presentation" onClick={() => promotion('b')}>
            <img src={bishop} alt="" style={{ width: 50 }} />
          </span>
          <span role="presentation" onClick={() => promotion('n')}>
            <img src={knight} alt="" style={{ width: 50 }} />
          </span>
        </div>
      </Modal>
    </div>
  );
}

export default ChessBoard;
