/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Piece from './collection/piece';
import PieceDisplay from './collection/pieceDisplay';
import defaultSettings from './collection/defaultSettings';

// eslint-disable-next-line no-unused-vars
const storageNode = {
  address: '0x31546eEA76F2B2b3C5cC06B1c93601dc35c9D916',
  url: 'https://corea1.streamr.network:8001',
};

function Collection(props) {
  const { address, client } = props;
  const [chessNFTs, setChessNFTs] = useState([]);
  const [equippedPieces, setEquippedPieces] = useState(JSON.parse(JSON.stringify(defaultSettings)));
  // const [settingsStream, setSettingsStream] = useState({});

  const settingsStreamId = `${address}/dechess/settings/equipped_pieces`;

  // eslint-disable-next-line no-unused-vars
  const fetchSettingsStream = async () => {
    try {
      console.log('attempting to fetch settings stream');
      /* await client.getStream(settingsStreamId)
        .then((stream) => {
          setSettingsStream(stream);
          console.log('stream fetched:', settingsStream);
        }); */
      await client.resend({
        streamId: settingsStreamId,
        resend: {
          last: 1,
        },
      }, (message) => {
        console.log('msg', message);
        setEquippedPieces(message);
        // console.log('new settings', equippedPieces);
      });
    } catch (getErr) {
      console.log('error fetching settings stream', getErr);
      try {
        /* this is bad code because we should only create when the stream doesn't
        exist but it can fail for other reasons e.g. user declines signature */
        console.log('attempting to create settings stream');
        await client.createStream({
          id: settingsStreamId,
        }).then((stream) => {
          // setSettingsStream(stream);
          stream.addToStorageNode(storageNode.address);
          stream.publish(defaultSettings);
          // make sure everyone else can get what pieces you're using
          stream.grantPermission('stream_get', null);
          stream.grantPermission('stream_subscribe', null);
          // console.log('stream created', stream);
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

  const setToDefault = (color, type) => {
    const streamrPiece = {};

    streamrPiece.name = defaultSettings[color][type].name;
    streamrPiece.description = defaultSettings[color][type].description;
    streamrPiece.contract_address = '';
    streamrPiece.token_id = '';
    streamrPiece.image_url = defaultSettings[color][type].image_url;

    const newEquippedPieces = { ...equippedPieces };
    // console.log('new equipped pieces', newEquippedPieces);
    newEquippedPieces[color][type] = streamrPiece;
    // console.log('default piece', streamrPiece, defaultSettings);

    setEquippedPieces(newEquippedPieces);
  };

  const saveEquippedPieces = async () => {
    // console.log('saving equipped pieces');
    try {
      // console.log('attempting to publish changes');
      client.publish(settingsStreamId, equippedPieces);
    } catch (publishErr) {
      console.log('failed to publish changes:', publishErr);
    }
  };

  useEffect(() => {
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
                fetchSettingsStream(); // fetch settings after everything loads in
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
    <div style={{ backgroundColor: '#2B313C' }}>
      <br />
      <PieceDisplay pieces={equippedPieces} saveEquippedPieces={saveEquippedPieces} />
      <br />
      <ul>
        {chessNFTs.map((piece) => (
          <li key={piece.token_id}>
            <Piece
              piece={piece}
              setPiece={setPiece}
              equippedPieces={equippedPieces}
              setToDefault={setToDefault}
            />
          </li>
        )) }
      </ul>
      <img src="loader.gif" alt="loading" id="loader" />
      <br />
    </div>
  );
}

export default Collection;
