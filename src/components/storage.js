import { Web3Storage, File } from 'web3.storage/dist/bundle.esm.min';

function getAccessToken() {
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDY5MTVjRmNFOGNhZEM1MDdlNjkwN0Q1YzRBOUQ4QTUwN0EyRjIwOTIiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2MzI2MTE1Mzc3MzIsIm5hbWUiOiJkZUNoZXNzIGVhcmx5IGFjY2VzcyJ9.FTLtNtU4p0o--lonig3WmDgE2xkmepp3R9ujYxB_w6E';
  // return process.env.WEB3STORAGE_API_KEY;
}

function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}

function makeFileObjects(obj) {
  const buffer = Buffer.from(JSON.stringify(obj));
  const files = [new File([buffer], 'game.json')];
  return files;
}

async function storeFiles(files) {
  const client = makeStorageClient();
  const cid = await client.put(files);
  return cid;
}

export { makeFileObjects, storeFiles };
