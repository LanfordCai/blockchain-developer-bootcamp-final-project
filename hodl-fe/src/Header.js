import React from 'react';

import { useWeb3React } from '@web3-react/core'
import { Button, Row, Col, Typography } from 'antd';
import { injected } from './connector'
import { ethers } from "ethers"
import * as testcoinABI from './testcoin_abi.json';

import 'antd/dist/antd.css';
const { Title } = Typography;

const Header = (props) => {
  const { library, account, activate, deactivate, active, error } = useWeb3React()

  const claimTestCoin = async () => {
    if (active) {
      console.log(library)
      const tokenContract = "0x91C538676eA5ca642fCcC386eAa8f0F7abcB3c2f"
      const token = new ethers.Contract(tokenContract, testcoinABI.default, library)
      const signer = token.connect(library.getSigner())
      await signer.faucet()
    }
  }

  return (
    <div className="header">
      <Row type="flex" justify="space-between" align="middle">
        <Col><Title level={2}>HODL Protocol</Title></Col>
        <Col>
          <Button onClick={() => {
              activate(injected)
            }} size='large'>{active ? account : "Connect Wallet"}
          </Button>
          {active ? <Button onClick={() => {
            claimTestCoin()
          }} size='large'>Faucet</Button> : null}
          {active ? <Button onClick={() => {
            deactivate(injected)
          }} size='large'>Disconnect</Button> : null}
        </Col>
      </Row>
          
    </div>
  );
}

export default Header;