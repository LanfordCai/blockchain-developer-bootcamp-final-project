import React from 'react';

import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'
import { Button, Row, Col, Typography } from 'antd';
import { injected } from './connector'
import { ethers } from 'ethers'
import { tokenContract } from './contracts'
import * as testcoinABI from './testcoin_abi.json';

import 'antd/dist/antd.css';
const { Title } = Typography;

function getErrorMessage(error) {
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network."
  } else if (error instanceof UserRejectedRequestErrorInjected) {
    return 'Please authorize this website to access your Ethereum account.'
  } else {
    console.error(error)
    return 'An unknown error occurred. Check the console for more details.'
  }
}

const Header = (props) => {
  const { library, account, activate, deactivate, active, error } = useWeb3React()

  const claimTestCoin = async () => {
    if (active) {
      console.log(library)
      const token = new ethers.Contract(tokenContract, testcoinABI.default, library)
      const signer = token.connect(library.getSigner())
      const tx = await signer.faucet()
      alert(`Transaction created: ${tx['hash']}`)
      await tx.wait()
      alert(`Transaction confirmed: ${tx['hash']}`)
    }
  }

  return (
    <div className="header">
      <Row type="flex" justify="space-between" align="middle">
        <Col><Title level={2}>HODL Protocol</Title></Col>
        <Col>{!!error ? <label>{getErrorMessage(error)}</label> : null}</Col>
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