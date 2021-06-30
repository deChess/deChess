import React, { useState, useEffect } from 'react';
import {
  Button, Col, Modal, Row,
} from 'antd';
import Chess from 'chess.js';
import Chessground from 'react-chessground';
import 'react-chessground/dist/styles/chessground.css'; // redundant import, but freaks out if i dont import this for whatever reason
import '../styles/chessground.css'; // overwrites previous chessground.css, allows easier/more customizability
import '../styles/chessboard.css'; // this one is for the buttons and text that aren't part of the board
import queen from '../images/wQ.svg';
import rook from '../images/wR.svg';
import bishop from '../images/wB.svg';
import knight from '../images/wN.svg';

function ChessBoard(props) {
  const { settings: { vsComputer }, client, code } = props; // pass in time control here
  const [chess] = useState(new Chess());
  const [pendingMove, setPendingMove] = useState();
  const [selectVisible, setSelectVisible] = useState(false);
  const [fen, setFen] = useState('');
  const [lastMove, setLastMove] = useState();
  const [isChecked, setChecked] = useState(false);
  const [viewOnly, setViewOnly] = useState(true);

  // uncomment this later, testing UI against PC and it doesnt load vs computer when this code runs
  useEffect(() => {
    client.subscribe({
      stream: code,
    },
    (message) => {
      // This function will be called when new messages occur
      setViewOnly(false);
      if (message.hello !== 'world') {
        const { move } = message;
        const { from, to } = move;
        const moves = chess.moves({ verbose: true });
        for (let i = 0, len = moves.length; i < len; i++) { /* eslint-disable-line */
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
        }
      }
    });
  }, [code]);

  const user1 = {
    username: '-', address: '-', elo: 0, mins: 15, secs: 0, cs: 0,
  }; // centiseconds i.e. 0.01
  const user2 = {
    username: '-', address: '-', elo: 0, mins: 15, secs: 0, cs: 0,
  };

  const randomMove = () => {
    const moves = chess.moves({ verbose: true });
    const move = moves[Math.floor(Math.random() * moves.length)];
    if (moves.length > 0) {
      chess.move(move.san);
      setFen(chess.fen());
      setLastMove([move.from, move.to]);
      setChecked(chess.in_check());
    }
  };

  const onMove = (from, to) => {
    const moves = chess.moves({ verbose: true });
    for (let i = 0, len = moves.length; i < len; i++) { /* eslint-disable-line */
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
      client.publish(code, {
        move:
        { from, to, promotion: 'q' },
        fen: chess.fen(),
      });
      // .then(() => console.log('Sent successfully: ', {
      //   move:
      //   { from, to, promotion: 'q' },
      //   fen: chess.fen(),
      // }));
      if (vsComputer) { setTimeout(randomMove, 500); }
    }
  };

  const promotion = (e) => {
    const from = pendingMove[0];
    const to = pendingMove[1];

    chess.move({ from, to, promotion: e });
    setFen(chess.fen());
    setLastMove([from, to]);
    setSelectVisible(false);
    setChecked(chess.in_check());
    client.publish(code, {
      move:
      { from, to, promotion: 'q' },
      fen: chess.fen(),
    });
    // .then(() => console.log('Sent successfully: ', {
    //   move:
    //     { from, to, promotion: 'q' },
    //   fen: chess.fen(),
    // }));
    if (vsComputer) { setTimeout(randomMove, 500); }
  };

  const turnColor = () => (chess.turn() === 'w' ? 'white' : 'black');

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

  const boardsize = Math.round((Math.min(window.innerWidth, window.innerHeight) * 0.77) / 8) * 8;

  return (
    <div style={{
      background: '#2b313c',
      height: '100vh',
    }}
    >
      <Row>
        <Col span={6} />
        <Col span={12}>
          <div className="username">{user1.username}</div>
          <div className="userAddress">{user1.address}</div>
          <div className="elo">{user1.elo}</div>
          <div id="user1Time" className="userTime">{`${user1.mins.toString(10)}:${user1.secs.toString(10)}`}</div>
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
            check={isChecked}
            style={{ marginTop: '10%', marginLeft: '10%' }}
          />
          <div className="username">{user2.username}</div>
          <div className="userAddress">{user2.address}</div>
          <div className="elo">{user2.elo}</div>
          <div id="user1Time" className="userTime">{`${user2.mins.toString(10)}:${user2.secs.toString(10)}`}</div>
        </Col>
        <Col span={6} />
      </Row>
      <Button>request takeback</Button>
      <Button>offer draw</Button>
      <Button>resign</Button>
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