/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Piece from './piece';

function Collection(props) {
  const { address } = props;
  const [chessNFTs, setChessNFTs] = useState([]);

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
                  validNFTs[k].contract_address = '0x0aee6e01d4bd12a9d80aa2fa64a2b53093fafda7';
                }
                newChessNFTs = raribleNFTs.concat(validNFTs);
                setChessNFTs(newChessNFTs);
                // console.log('final chess nfts: ', chessNFTs);
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
    <div>
      <br />
      {chessNFTs.map((piece) => (
        <Piece piece={piece} />
      )) }
    </div>
  );
}

export default Collection;
