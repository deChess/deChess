/* eslint-disable no-console */
import React, { useState, useEffect /* , Component */ } from 'react';
import {
  Button, Col, Modal, Row, Input,
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
// eslint-disable-next-line no-unused-vars
import { makeFileObjects, storeFiles, getAccessToken } from './storage';
import queen from '../images/wQ.svg';
import rook from '../images/wR.svg';
import bishop from '../images/wB.svg';
import knight from '../images/wN.svg';
import defaultSettings from './collection/defaultSettings';

const { Search } = Input;

let doOnce = true; // this is for knowing when both players have joined, i.e. this becomes false
let clockStarted = false; // let clock start at correct time
const joined = []; // array of player addresses who have joined
let gameDataInitialized = false;

let uploaded = false;

let gameOver = false;

const drawOffer = {
  drawOffered: false,
  drawAccepted: false,
};

// const movesList = [];

const addressShorthand = (address) => (address === 'computer' ? address : `${address.substring(0, 5)}...${address.substring(address.length - 5, address.length)}`);

// eslint-disable-next-line no-restricted-globals
// eslint-disable-next-line max-len
// const getTimeControl = (totalTime, increment) => `${parseInt(totalTime / 60000, 10)}+${isNaN(increment) ? 0 : parseInt(increment / 1000, 10)}`;

const elapsedTime = { white: 0, black: 0 };

// source for PGN stuff: http://www.saremba.de/chessgml/standards/pgn/pgn-complete.htm
const gameData = { // this will be converted to the JSON file that is uploaded to web3.storage
  streamID: '',
  uploader: '',
  black: {
    address: '', totalTime: 0, remainingTime: 0, rating: '-', increment: 0,
  },
  white: {
    address: '', totalTime: 0, remainingTime: 0, rating: '-', increment: 0,
  },
  startTime: -1,
  moveTimes: [],
  result: '*',
  pgn: '', // put tags or not?
  chat: [],
};

function ChessBoard(props) {
  // eslint-disable-next-line no-unused-vars
  const {
    settings: {
      vsComputer, startColor, black, white, streamId,
    }, client, code,
  } = props;

  const opponentColor = startColor === 'white' ? 'black' : 'white';
  const colSymbols = { white: '⚪ - ', black: '⚫ - ' }; // uses non-breaking spaces

  if (!gameDataInitialized) {
    gameData.black.address = black.address;
    gameData.black.totalTime = black.time;
    gameData.black.remainingTime = black.time;
    gameData.black.rating = black.rating;
    gameData.black.increment = black.increment;

    gameData.white.address = white.address;
    gameData.white.totalTime = white.time;
    gameData.white.remainingTime = white.time;
    gameData.white.rating = white.rating;
    gameData.white.increment = white.increment;

    gameData.uploader = gameData[startColor].address;

    gameData.streamID = streamId;
    gameDataInitialized = true;
  }

  const home = gameData[startColor];
  const opponent = gameData[opponentColor];

  // localStorage.setItem('streamID', gameData.streamID); // used to test, might be used in future

  const [chess] = useState(new Chess());
  const [pendingMove, setPendingMove] = useState();
  const [selectVisible, setSelectVisible] = useState(false);
  const [fen, setFen] = useState('');
  const [lastMove, setLastMove] = useState();
  const [isChecked, setChecked] = useState(false);
  const [viewOnly, setViewOnly] = useState(true);
  const [color, setColor] = useState(startColor);
  const [orientation, setOrientation] = useState(startColor);
  const [pieces, setPieces] = useState(JSON.parse(JSON.stringify(defaultSettings)));

  const currDate = new Date();
  const dateToday = `${currDate.getFullYear()}.${currDate.getMonth() + 1 < 10 ? '0' : ''}${currDate.getMonth() + 1}.${currDate.getDate() < 10 ? '0' : ''}${currDate.getDate()}`;
  const UTCDateToday = `${currDate.getFullYear()}.${currDate.getMonth() + 1 < 10 ? '0' : ''}${currDate.getMonth() + 1}.${currDate.getDate() < 10 ? '0' : ''}${currDate.getDate()}`;

  function updateLog() { // called at every move (and then some)
    const game = chess.pgn();
    gameData.pgn = game;
    const moves = chess.history();

    const movePairs = [];
    for (let i = 0; i < moves.length; i += 2) {
      movePairs.push([moves[i], moves[i + 1] !== undefined ? moves[i + 1] : '']);
    }

    const displayedMoves = [];
    for (let i = 0; i < movePairs.length; i += 1) {
      displayedMoves.push(`${i + 1}. ${movePairs[i][0]} ${movePairs[i][1]}`);
    }

    const log = document.getElementById('innerLog');
    log.scrollTop = log.scrollHeight;
    log.innerHTML = `<p>${displayedMoves.join('<br></br>')}</p>`;

    if (vsComputer && !clockStarted) { clockStarted = true; gameData.startTime = Date.now(); }

    if (chess.in_threefold_repetition()) {
      drawOffer.drawOffered = true; // draw offer extended to both players if in 3-fold rep
    }

    if (chess.game_over()
    || gameData[startColor].remainingTime <= 0 || gameData[opponentColor].remainingTime <= 0
    || (drawOffer.drawOffered && drawOffer.drawAccepted)) {
      gameOver = true;
      let whiteWon = false;
      let gameDrawn = false;

      if (gameData[startColor].remainingTime <= 0) { // opponent wins on time
        whiteWon = startColor === 'black';
      } else if (gameData[opponentColor].remainingTime <= 0) { // home wins on time
        whiteWon = startColor === 'white';
      } else if (chess.game_over() && !chess.in_checkmate()) { // draw/stalemate
        whiteWon = false;
      }

      let finalComment = '';

      if (gameData[startColor].remainingTime <= 0 || gameData[opponentColor].remainingTime <= 0) {
        finalComment = ` ${whiteWon ? 'White' : 'Black'} wins on time. `;
        chess.header('Termination', 'Time forfeit');
      } else if (chess.in_stalemate()) {
        finalComment = ' Draw by stalemate. ';
      } else if (chess.in_draw() && !chess.insufficient_material()) {
        gameDrawn = true;
        finalComment = ' Draw by 50 move rule. ';
      } else if (chess.in_draw() && chess.insufficient_material()) {
        gameDrawn = true;
        finalComment = ' Draw by insufficent material. ';
      } else if (chess.in_checkmate()) {
        // check who moved last
        whiteWon = chess.history.length % 2 === 1; // odd means white moved last
        finalComment = ` ${whiteWon ? 'White' : 'Black'} wins by checkmate. `;
      } else if (chess.in_threefold_repetition()) {
        gameDrawn = true;
        finalComment = ' Draw by threefold repetition. ';
      }
      chess.set_comment(finalComment);
      const gameResult = gameDrawn ? '1/2-1/2' : (whiteWon ? '1-0' : '0-1');
      chess.header(
        'Event', 'deChess Casual Game',
        'Site', 'https://dechess.eth.link',
        'Date', dateToday,
        'White', gameData.white.address,
        'Black', gameData.black.address,
        'UTCDate', UTCDateToday,
        'UTCTime', `${currDate.getUTCHours()}:${currDate.getUTCMinutes()}:${currDate.getUTCSeconds.length === 1 ? '0' : ''}${currDate.getUTCSeconds()}`,
        'WhiteElo', gameData.white.rating,
        'BlackElo', gameData.black.rating,
        'Annotator', 'dechess.eth',
        'Result', gameResult,
      );
      gameData.result = gameResult;
      gameData.pgn = chess.pgn();
      if (!uploaded) {
        const uploadedFiles = makeFileObjects(gameData);
        const uploadedFilesCID = storeFiles(uploadedFiles);
        uploaded = true;
        return uploadedFilesCID;
      }
    }

    return '';
  }

  const updateChat = (msg) => {
    if (gameData.chat[gameData.chat.length - 1] !== msg) { // in case of duplicate received msgs
      gameData.chat.push(msg);
    }
    const chat = document.getElementById('chatLog');
    chat.scrollTop = chat.scrollHeight;

    const parsedChat = [];
    for (let i = 0; i < gameData.chat.length; i += 1) {
      parsedChat.push(`<p><b>${addressShorthand(gameData.chat[i].from)}</b>: ${gameData.chat[i].message}<p/>`);
    }

    chat.innerHTML = `${parsedChat.join('')}`;
  };

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

  const setPieceImages = () => {
    // console.log('setting images', pieces);
    for (let i = 1; i < 65; i += 1) { // check every square
      const piece = document.querySelector(`#chessboard > div > cg-helper > cg-container > cg-board > piece:nth-child(${i})`);
      // console.log(i, piece);
      if (piece !== undefined && piece !== null) {
        const [currPieceColor, currPieceType] = piece.className.split(' ');
        piece.style['background-image'] = `url(${pieces[currPieceColor][currPieceType].image_url})`;
        // eslint-disable-next-line max-len
        // console.log(i, document.querySelector(`#chessboard > div > cg-helper > cg-container > cg-board > piece:nth-child(${i})`));
      }
    }
  };

  const getOwnPieces = async () => {
    try {
      await client.resend({
        streamId: `${home.address}/dechess/settings/equipped_pieces`,
        resend: {
          last: 1,
        },
      }, (message) => {
        // console.log('self pieces received', message);
        const newPieces = { ...pieces };
        newPieces[startColor] = message[startColor];
        setPieces(newPieces);
      });
    } catch (err) {
      console.log('attempted to fetch own pieces', err);
    }
    // console.log('pieces set own:', pieces);
  };

  const getOpponentPieces = async () => {
    try {
      await client.resend({
        streamId: `${opponent.address}/dechess/settings/equipped_pieces`,
        resend: {
          last: 1,
        },
      }, (message) => {
        // console.log('opponent pieces received', message);
        const newPieces = { ...pieces };
        newPieces[opponentColor] = message[opponentColor];
        setPieces(newPieces).then(() => {
          setPieceImages();
        });
      });
    } catch (error) {
      console.log('attemped to fetch opponent pieces', error);
    }
    // console.log('pieces set opponent:', pieces);
  };

  useEffect(() => {
    setPieceImages();
  }, [pieces]);

  useEffect(() => {
    setPieceImages();

    if (doOnce) {
      getOwnPieces();
      getOpponentPieces();
      setViewOnly(true);
    }

    if (vsComputer) {
      setViewOnly(false);
    } else {
      client.subscribe({
        stream: code,
      },
      (message, metadata) => {
        // This function will be called when new messages occur
        // note: will also receive own messages
        const msgTime = metadata.messageId.timestamp;
        const currTime = Date.now();
        const msgLatency = currTime - msgTime;
        if (message.type === 'move') {
          if (!clockStarted) {
            gameData.startTime = msgTime;
            clockStarted = true; // start clock if not started
            console.log('game started!');
          }
          if (color !== turnColor()) { // opponent's move
            const { move } = message;
            const { from, to, promotion } = move;
            const moves = chess.moves({ verbose: true });
            for (let i = 0, len = moves.length; i < len; i += 1) {
              if (moves[i].flags.indexOf('p') !== -1 && moves[i].from === from) {
                setPendingMove([from, to]);
                if (turnColor() === startColor) {
                  setSelectVisible(true); // only person playing move can see promotion
                  return;
                }
              }
            }
            const moveResult = chess.move({ from, to, promotion });
            // console.log(move, moveResult);
            const lastMoveSAN = chess.history()[chess.history().length - 1]; // last move in SAN
            if (moveResult) { // move successful
              setFen(chess.fen());
              setLastMove([from, to]);
              setChecked(chess.in_check());
            }
            if (gameData.moveTimes.length !== chess.history().length) {
              gameData.moveTimes.push({
                move: lastMoveSAN,
                time: msgTime, // streamr time
                latency: msgLatency,
              });
              const lastLastMove = gameData.moveTimes[gameData.moveTimes.length - 2];
              const lastMoveTime = lastLastMove ? msgTime - lastLastMove.time : 0;
              // time between curr and prior move, if there is only 1 move then time to move is 0
              // if white just moved, then lastMoveTime is the time that white to move,
              // and vice versa for black
              if (chess.history().length % 2 === 1) { // even move history means white just moved
                elapsedTime.white += lastMoveTime;
              } else {
                elapsedTime.black += lastMoveTime;
              }
              // console.log(`move ${lastMoveSAN} was played in ${lastMoveTime} milliseconds.`);
            }
            // console.log(move, gameData);
            setViewOnly(false); // can play now
            updateLog();
          } else {
            setViewOnly(true);
          }
        } else if (message.type === 'join' || message.type === 'ready' || message.type === 'start') {
          if (!joined.includes(message.from)) {
            joined.push(message.from);
          }
        } else if (message.type === 'command') { // maybe add one for chat too?
          if (message.command === 'offer_draw') {
            drawOffer.drawOffered = true;
          }
        } else if (message.type === 'chat') {
          // console.log(`message sent: ${message.message}`);
          updateChat(message);
        }
        if (message.type === 'ready') {
          const msg = {
            type: 'start',
            from: home.address,
            time: Date.now(),
          };
          client.publish(code, msg);
        }
        if (doOnce) { // both players have now joined
          const msg = {
            type: 'ready',
            from: home.address,
            color: startColor,
            time: Date.now(),
          };
          if (startColor === 'white') {
            setViewOnly(false); // white plays first move
          }
          // Publish the event to the Stream
          client.publish(code, msg);
          doOnce = false;
        }
      });
    }
  }, [code, color]);

  // chess clock
  let clockInterval = 25; // use this to change how fast the clock ticks
  useEffect(() => {
    const chessClock = setInterval(() => {
      const homeTime = document.getElementById('homeTime');
      const opponentTime = document.getElementById('opponentTime');
      const whiteTime = startColor === 'white' ? homeTime : opponentTime;
      const blackTime = startColor === 'black' ? homeTime : opponentTime;
      const lastMoveObj = gameData.moveTimes[gameData.moveTimes.length - 1];
      const timeFromLastMove = lastMoveObj !== undefined ? Date.now() - lastMoveObj.time : 0;
      const whiteToMove = gameData.moveTimes.length % 2 === 0;
      // ^ time taken for current move
      if (homeTime != null && opponentTime != null && !gameOver && clockStarted) {
        // eslint-disable-next-line max-len
        const newWhiteRemainingTime = gameData.white.totalTime - elapsedTime.white - (whiteToMove ? timeFromLastMove : 0);
        // eslint-disable-next-line max-len
        const newBlackRemainingTime = gameData.black.totalTime - elapsedTime.black - (!whiteToMove ? timeFromLastMove : 0);
        if (newWhiteRemainingTime < gameData.white.remainingTime) {
          gameData.white.remainingTime = newWhiteRemainingTime;
          whiteTime.innerHTML = formatTime(gameData.white.remainingTime);
        }
        if (newBlackRemainingTime < gameData.black.remainingTime) {
          gameData.black.remainingTime = newBlackRemainingTime;
          blackTime.innerHTML = formatTime(gameData.black.remainingTime);
        }
      }
      if (gameData[startColor].remainingTime <= 0 || gameData[opponentColor].remainingTime <= 0) {
        gameOver = true;
        setViewOnly(true); // moves can no longer be played
        updateLog(); // update log one last time after game is over
      }
    }, clockInterval);
    return () => clearInterval(chessClock);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { // tab is inactive, i.e. not in focus
      clockInterval = 1000; // inactive tabs have auto 1s intervals, so set to 1s
    } else {
      clockInterval = 100; // active tabs change every 100ms
    }
  });

  // ping opponent
  useEffect(() => {
    const poke = setInterval(() => {
      if (startColor === 'white' && chess.turn() === 'w' && viewOnly) {
        const msg = {
          type: 'ready',
          from: home.address,
          message: 'pls respond :(',
          time: Date.now(),
        };
        client.publish(code, msg);
      }
      if (joined.includes(gameData.black.address) && joined.includes(gameData.white.address)) {
        clearInterval(poke); // stop poking if they respond
      }
    }, 1000);
    return () => clearInterval(poke);
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
        if (turnColor() === startColor) {
          setSelectVisible(true);
        }
        return;
      }
    }
    if (chess.move({ from, to, promotion: 'q' })) {
      setFen(chess.fen());
      setLastMove([from, to]);
      setChecked(chess.in_check());
      setColor(turnColor());
      if (vsComputer) {
        setTimeout(randomMove, 500);
      } else {
        client.publish(code, {
          type: 'move',
          move:
          { from, to, promotion: 'q' },
          from: gameData[startColor].address,
          time: Date.now(),
          fen: chess.fen(),
        });
      }
    }
    // updateLog();
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
    if (vsComputer) {
      setTimeout(randomMove, 500);
    } else {
      client.publish(code, {
        type: 'move',
        move:
        { from, to, promotion: e },
        from: gameData[startColor].address,
        time: Date.now(),
        fen: chess.fen(),
      });
    }
    // updateLog();
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

  const boardsize = Math.round((Math.min(window.innerWidth, window.innerHeight) * 0.91) / 8) * 8;

  const sendMessage = (msg) => {
    document.getElementById('chatSend').value = '';
    if (msg !== '' && !vsComputer) {
      client.publish(code, {
        type: 'chat',
        from: gameData[startColor].address,
        time: Date.now(),
        message: msg,
      });
      console.log(msg);
    } else if (vsComputer) {
      console.log("can't send messages to the computer");
    } else {
      console.log("message can't be empty!");
    }
  };

  // eslint-disable-next-line no-return-assign
  return (
    <div style={{
      background: '#2b313c',
      height: '100vh',
    }}
    >
      <div id="everything">
        <div id="dashboard">
          <p style={{
            fontSize: '20px',
            textAlign: 'center',
          }}
          >
            Chat
          </p>
          <div id="chat">
            <div id="chatLog" />
            <Search enterButton="send" placeholder="say something nice :)" id="chatSend" onSearch={sendMessage} />
          </div>
        </div>
        <div id="chessboard">
          <Row>
            <Col span={12}>
              <div id="chessboard">
                <Chessground
                  width={boardsize}
                  height={boardsize}
                  turnColor={turnColor()}
                  movable={calcMovable()}
                  lastMove={lastMove}
                  fen={fen}
                  onMove={onMove}
                  highlight={{
                    check: true,
                    lastMove: true,
                  }}
                  premovable={{
                    enabled: true,
                    showDests: true,
                    castle: true,
                  }}
                  check={isChecked.toString()}
                  style={{ margin: '5%' }}
                  orientation={orientation}
                />
              </div>
            </Col>
          </Row>
        </div>
        <div id="dashboard">
          <p style={{
            fontSize: '20px',
            textAlign: 'center',
          }}
          >
            Moves
          </p>
          <div id="innerLog" />
          <div className="user">
            <div className="userinfo">
              <div className="userAddress" style={{ textAlign: 'center' }}>{`${colSymbols[startColor]}‎‎‎${addressShorthand(home.address)}`}</div>
              <div className="rating">{gameData[startColor].rating !== '-' ? '' : `rating: ${gameData[startColor].rating}`}</div>
              <div id="homeTime" className="userTime" style={{ textAlign: 'center' }}>{formatTime(gameData[startColor].remainingTime)}</div>
            </div>
          </div>
          <div id="buttons">
            <Button style={{ width: '7vw', margin: '6px' }}>offer draw</Button>
            <Button style={{ width: '4vw', margin: '6px' }} onClick={() => setOrientation(flipBoard())}>🔄</Button>
            <Button style={{ width: '7vw', margin: '6px' }}>resign</Button>
          </div>
          <div className="user">
            <div className="userinfo">
              <div className="userAddress" style={{ textAlign: 'center' }}>{`${colSymbols[opponentColor]}‎‎‎${addressShorthand(opponent.address)}`}</div>
              <div className="rating">{gameData[opponentColor].rating !== '-' ? '' : `rating: ${gameData[opponentColor].rating}`}</div>
              <div id="opponentTime" className="userTime" style={{ textAlign: 'center' }}>{formatTime(gameData[opponentColor].remainingTime)}</div>
            </div>
          </div>
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
