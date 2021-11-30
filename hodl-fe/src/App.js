import React from "react";
import Header from "./Header";
import VaultCreator from "./VaultCreator";
import Vaults from "./Vaults";
import { Divider } from 'antd';
import { useEagerConnect, useInactiveListener } from './hooks'

import { useWeb3React } from '@web3-react/core'

const App = () => {
  const context = useWeb3React()
  const { connector } = context
  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = React.useState()
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector])

  const [value, setValue] = React.useState(0);

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector)

  return (
    <div className="hodlApp">
      <Header handleTxConfirmed={() => {
        setValue(value => value + 1)
      }} />
      <Divider />
      <VaultCreator handleTxConfirmed={() => {
        setValue(value => value + 1)
      }} trigger={value} />
      <Divider />
      <Vaults trigger={value} handleTxConfirmed={ () => {
        setValue(value => value + 1)
      }
      }/>
    </div>
  );
}
 
export default App;