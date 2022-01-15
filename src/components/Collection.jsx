/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import Piece from './piece';

const defaultSettings = {
  white: {
    pawn: {
      name: 'merida white pawn',
      description: 'default white pawn',
      contract_address: '',
      token_id: '',
      image_url: '../images/pieces/merida/wP.svg',
    },
    rook: {
      name: 'merida white rook',
      description: 'default white rook',
      contract_address: '',
      token_id: '',
      image_url: '../images/pieces/merida/wR.svg',
    },
    knight: {
      name: 'merida white knight',
      description: 'default white knight',
      contract_address: '',
      token_id: '',
      image_url: '../images/pieces/merida/wN.svg',
    },
    bishop: {
      name: 'merida white bishop',
      description: 'default white bishop',
      contract_address: '',
      token_id: '',
      image_url: '../images/pieces/merida/wB.svg',
    },
    queen: {
      name: 'merida white queen',
      description: 'default white queen',
      contract_address: '',
      token_id: '',
      image_url: '../images/pieces/merida/wQ.svg',
    },
    king: {
      name: 'merida white king',
      description: 'default white king',
      contract_address: '',
      token_id: '',
      image_url: '../images/pieces/merida/wK.svg',
    },
  },
  black: {
    pawn: {
      name: 'merida black pawn',
      description: 'default black pawn',
      contract_address: '',
      token_id: '',
      image_url: '../images/pieces/merida/bP.svg',
    },
    rook: {
      name: 'merida black rook',
      description: 'default black rook',
      contract_address: '',
      token_id: '',
      image_url: '../images/pieces/merida/bR.svg',
    },
    knight: {
      name: 'merida black knight',
      description: 'default black knight',
      contract_address: '',
      token_id: '',
      image_url: '../images/pieces/merida/bN.svg',
    },
    bishop: {
      name: 'merida black bishop',
      description: 'default black bishop',
      contract_address: '',
      token_id: '',
      image_url: '../images/pieces/merida/bB.svg',
    },
    queen: {
      name: 'merida black queen',
      description: 'default black queen',
      contract_address: '',
      token_id: '',
      image_url: '../images/pieces/merida/bQ.svg',
    },
  },
};

// eslint-disable-next-line no-unused-vars
const storageNode = {
  address: '0x31546eEA76F2B2b3C5cC06B1c93601dc35c9D916',
  url: 'https://corea1.streamr.network:8001',
};

function Collection(props) {
  const { address, client } = props;
  const [chessNFTs, setChessNFTs] = useState([]);
  const [equippedPieces, setEquippedPieces] = useState(defaultSettings);

  let settingsStream = {};

  const settingsStreamId = `${address}/dechess/settings/equipped_pieces`;

  // eslint-disable-next-line no-unused-vars
  const fetchSettingsStream = async () => {
    try {
      console.log('attempting to fetch settings stream');
      await client.getStream(settingsStreamId)
        .then((stream) => {
          // setSettingsStream(stream);
          settingsStream = stream;
          console.log('stream fetched:', settingsStream);
        });
      await client.resend({
        streamId: settingsStreamId,
        resend: {
          last: 1,
        },
      }, (message) => {
        console.log('msg', message);
        /* defaultSettings.black = message.black;
        defaultSettings.white = message.white; */
        setEquippedPieces(message);
        // console.log('new settings', equippedPieces);
      });
    } catch (getErr) {
      console.log('error fetching settings stream', getErr);
      try {
        console.log('attempting to create settings stream');
        await client.createStream({
          id: settingsStreamId,
        }).then((stream) => {
          // setSettingsStream(stream);
          settingsStream = stream;
          stream.addToStorageNode(storageNode.address);
          stream.publish(defaultSettings);
          console.log('stream created', stream);
        });
      } catch (createErr) {
        console.log('error creating settings stream', createErr);
      }
    }
  };

  const setPiece = (piece) => {
    // console.log('piece:', piece);
    const pieceData = piece.external_data;
    const { attributes } = pieceData;
    const streamrPiece = {};

    streamrPiece.name = pieceData.name;
    streamrPiece.description = pieceData.description;
    streamrPiece.contract_address = piece.contract_address;
    streamrPiece.token_id = piece.token_id;
    streamrPiece.image_url = pieceData.image;
    // console.log('streamrPiece:', streamrPiece);

    const pieceColor = attributes.color;
    const pieceType = attributes['piece type'];

    const newEquippedPieces = { ...equippedPieces };
    // console.log('new equipped pieces', newEquippedPieces);
    newEquippedPieces[pieceColor][pieceType] = streamrPiece;

    setEquippedPieces(newEquippedPieces);

    // console.log('default settings:', newEquippedPieces);
  };

  useEffect(() => {
    fetchSettingsStream();
    axios.get(`https://api.covalenthq.com/v1/1/address/${address}/balances_v2/?nft=true&key=${process.env.REACT_APP_COVALENT_API_KEY}`)
      .then((res) => {
        const chainTokens = res.data.data.items;
        // console.log(chainTokens);
        let raribleNFTs = [];
        for (let j = 0; j < chainTokens.length; j += 1) {
          if (chainTokens[j].contract_address === '0xf6793da657495ffeff9ee6350824910abc21356c') { // rarible, ethereum
            raribleNFTs = chainTokens[j].nft_data;
            // console.log('rarible tokens: ', raribleNFTs);
          }
        }
        for (let i = 0; i < raribleNFTs.length; i += 1) {
          raribleNFTs[i].contract_address = '0xf6793da657495ffeff9ee6350824910abc21356c';
        }
        axios.get(`https://api.covalenthq.com/v1/137/address/${address}/balances_v2/?nft=true&key=${process.env.REACT_APP_COVALENT_API_KEY}`)
          .then((nftportRes) => {
            const polygonTokens = nftportRes.data.data.items;
            for (let i = 0; i < polygonTokens.length; i += 1) {
              let newChessNFTs = raribleNFTs;
              if (polygonTokens[i].contract_address === '0x0aee6e01d4bd12a9d80aa2fa64a2b53093fafda7' && polygonTokens[i].nft_data !== null) {
                // ^ nftport
                const validNFTs = [];
                // console.log(polygonTokens[i]);
                const tokensInContract = polygonTokens[i].nft_data;
                for (let k = 0; k < tokensInContract.length; k += 1) {
                  const token = tokensInContract[k];
                  const tokenData = token.external_data;
                  if (tokenData.attributes !== null) {
                    // console.log('valid token: ', token);
                    validNFTs.push(token);
                  }
                }
                for (let k = 0; k < validNFTs.length; k += 1) {
                  validNFTs[k].contract_address = 'matic/0x0aee6e01d4bd12a9d80aa2fa64a2b53093fafda7';
                }
                newChessNFTs = raribleNFTs.concat(validNFTs);
                setChessNFTs(newChessNFTs);
                // console.log('final chess nfts: ', chessNFTs);
                const loader = document.getElementById('loader');
                loader.style.display = 'none';
              }
            }
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [address]);

  return (
    <ul>
      <Button onClick={() => console.log()}>print piece</Button>
      <br />
      {chessNFTs.map((piece) => (
        <li key={piece.token_id}>
          <Piece piece={piece} setPiece={setPiece} />
        </li>
      )) }
      <img src="loader.gif" alt="loading" id="loader" />
    </ul>
  );
}

export default Collection;
