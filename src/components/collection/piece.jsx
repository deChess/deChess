/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/img-redundant-alt */
// how a piece is displayed on collection page
import React from 'react';
import '../../styles/display.css';
import { Button } from 'antd';

function Piece(props) {
  const {
    piece,
    setPiece,
    equippedPieces,
    setToDefault,
  } = props;

  const contractAddress = piece.contract_address;
  const tokenID = piece.token_id;
  const pieceData = piece.external_data;
  const { attributes } = pieceData;

  if (attributes.color !== 'white' && attributes.color !== 'black') {
    attributes.color = 'black';
    // there are some NFTs minted with weird colors so I'll default them to black
  }

  // console.log('piece in piece', piece);

  return (
    <div className="piece" id={pieceData.name.replace(/\s/g, '')}>
      <br />
      <h1>{pieceData.name}</h1>
      <img src={pieceData.image} alt="oops, looks like this image couldn't load" style={{ maxHeight: '300px' }} />
      <h3 className="piece-description">
        {`description: ${pieceData.description}`}
      </h3>
      <h3 className="type">
        {`type: ${attributes['piece type']}`}
      </h3>
      <h3 className="color">
        {`color: ${attributes.color}`}
      </h3>
      <a href={`https://opensea.io/assets/${contractAddress}/${tokenID}`} target="_blank" rel="noreferrer">
        <img className="opensea" src="opensea.png" alt="OpenSea" />
      </a>
      {
      equippedPieces[attributes.color][attributes['piece type']].name !== pieceData.name
        ? <Button className="equipButton" onClick={() => setPiece(piece)} type="primary" shape="round" size="large">Equip</Button>
        : <Button className="unequipButton" onClick={() => setToDefault(attributes.color, attributes['piece type'])} type="primary" shape="round" size="large">Unequip</Button>
      }
    </div>
  );
}

export default Piece;
