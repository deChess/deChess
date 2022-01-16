/* eslint-disable jsx-a11y/img-redundant-alt */

import React from 'react';
import { Button } from 'antd';
import '../../styles/display.css';

function PieceDisplay(props) {
  const { pieces, saveEquippedPieces } = props;
  // console.log('pieces to display:', pieces);

  const pieceOrder = ['pawn', 'rook', 'king', 'queen', 'bishop', 'knight'];

  const { black, white } = pieces;
  // console.log(black, white);

  return (
    <div id="pieceDisplay">
      <h1>Equipped Pieces</h1>
      <ul className="pieceRow">
        {pieceOrder.map((piece) => (
          <li className="displayedPiece" key={black[piece].name}>
            <img src={`${black[piece].image_url}`} alt="oops, looks like this image couldn't load" style={{ maxHeight: '100px' }} />
          </li>
        ))}
        <li style={{ display: 'inline' }}> </li>
        {pieceOrder.reverse().map((piece) => (
          <li className="displayedPiece" key={white[piece].name}>
            <img src={`${white[piece].image_url}`} alt="oops, looks like this image couldn't load" style={{ maxHeight: '100px' }} />
          </li>
        ))}
      </ul>
      <Button onClick={() => saveEquippedPieces()} shape="round" size="large">Save</Button>
    </div>
  );
}

export default PieceDisplay;
