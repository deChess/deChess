/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/img-redundant-alt */
// how a piece is displayed on collection page
import React from 'react';
import '../styles/display.css';

function Piece(piece) {
  const contractAddress = piece.piece.contract_address;
  const tokenID = piece.piece.token_id;
  const pieceData = piece.piece.external_data;
  const { attributes } = pieceData;
  // eslint-disable-next-line no-console
  // console.log(pieceData);
  return (
    <div>
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
        <br />
      </div>
      <br />
    </div>
  );
}

export default Piece;
