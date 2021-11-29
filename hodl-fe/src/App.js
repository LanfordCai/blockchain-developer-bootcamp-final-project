import React from "react";
import Header from "./Header";
import VaultCreator from "./VaultCreator";
import Vault from "./Vault";
import { Divider } from 'antd';
import { useEagerConnect, useInactiveListener } from './hooks'

import { Web3ReactProvider, useWeb3React, UnsupportedChainIdError } from '@web3-react/core'

const App = () => {
  const context = useWeb3React()
  const { connector, library, chainId, account, activate, deactivate, active, error } = context
  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = React.useState()
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector])

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector)

  return (
    <div className="hodlApp">
      <Header />
      <Divider />
      <VaultCreator />
      <Divider />
      <Vault />
    </div>
  );
}
 
export default App;