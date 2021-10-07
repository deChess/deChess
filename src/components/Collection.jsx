import React from 'react';
import { Button } from 'antd';

function Collection() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex',
    }}
    >
      <Button
        style={{ marginTop: 100 }}
        size="large"
      >
        Mint a random horse piece

      </Button>
    </div>
  );
}

export default Collection;
