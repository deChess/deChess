import ChessBoard from './components/Chessboard';
import {Button, Row, Col} from 'antd';
import 'antd/dist/antd.css';
import { useState } from 'react';


function App() {

  const [gameStarted, setGameStarted] = useState(false);
 
  return (
    <div style={{ background: "#2b313c", height: "100vh" }}>
      {!gameStarted && (
        <>
          <Row justify="space-around" align="middle">
            <Col span={1}>
              <Button onClick={()=>setGameStarted(true)}>Start Game</Button>
            </Col>
          </Row>
        </>
      )}
      {gameStarted && <ChessBoard/>}
    </div>
  )
}

export default App;
