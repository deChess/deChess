import { Web3Storage } from 'web3.storage';

function getAccessToken() {
  return process.env.WEB3STORAGE_API_KEY;
}

function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}

function makeFileObjects(obj) {
  const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
  return [new File([blob], 'game.json')];
}

async function storeFiles(files) {
  const client = makeStorageClient();
  const cid = await client.put(files);
  return cid;
}

export { makeFileObjects, storeFiles };
