import React from 'react'
import { useWeb3React } from '@web3-react/core'
import { Button, Row, Col, Typography, List, Card, Divider } from 'antd';
import * as hodlABI from './hodl_abi.json';
import { tokenContract, hodlContract } from './contracts'
import { ethers } from 'ethers';
import * as erc20ABI from './erc20_abi.json';

const { Title } = Typography;

const Vaults = (props) => {
  const { account, library, active } = useWeb3React()
  const [vaults, setVaults] = React.useState([])
  const [count, setCount] = React.useState(0)

  const vault = new ethers.Contract(hodlContract, hodlABI.default, library)
  const token = new ethers.Contract(tokenContract, erc20ABI.default, library)

  const getVaults = async () => {
    const statuses = {
      0: "Active", 1: "Redeemed", 2: "ForceRedeemed", 3: "Claimed"
    }
    try {
      const count = await vault.lockCount(account)
      const decimals = await token.decimals()
      let vs = []
      for (let i = 0; i < count; i++) {
        try {
          let lock = await vault.locks(account, i)
          let v = {
            amount: ethers.utils.formatUnits(lock.amount, decimals),
            initAmount: ethers.utils.formatUnits(lock.amountRecord, decimals),
            lockWindow: lock.lockWindow.toString(),
            lockAt: new Date(lock.lockAt.toNumber() * 1000).toISOString(),
            unlockAt: new Date(lock.unlockTime.toNumber() * 1000).toISOString(),
            penalty: `${lock.penalty.toString()}%`,
            index: i,
            status: statuses[lock.status]
          }
          vs.push(v)
        } catch (e) {
          console.log(e)
          break
        }
      }

      setVaults(vs)
    } catch (e) {
      alert(e.message)
    }
  }

  React.useEffect(() => {
    if (active) {
      getVaults()
    } else {
      setVaults([])
    }
  }, [active, props.trigger, count, account])

  const handleRedeem = async (index) => {
    try {
      const signer = vault.connect(library.getSigner())
      const tx = await signer.redeem(index)
      alert(`Transaction created: ${tx['hash']}`)
      await tx.wait()
      alert(`Transaction confirmed: ${tx['hash']}`)
      setCount(value => value + 1)
    } catch (e) {
      alert(e.message)
    }
  }

  const handleForceRedeem = async (index) => {
    try {
      const signer = vault.connect(library.getSigner())
      const tx = await signer.forceRedeem(index)
      alert(`Transaction created: ${tx['hash']}`)
      await tx.wait()
      alert(`Transaction confirmed: ${tx['hash']}`)
      setCount(value => value + 1)
    } catch (e) {
      alert(e.message)
    }
  }

  const handleClaim = async (index) => {
    try {
      const signer = vault.connect(library.getSigner())
      const tx = await signer.claim(index)
      alert(`Transaction created: ${tx['hash']}`)
      await tx.wait()
      alert(`Transaction confirmed: ${tx['hash']}`)
      setCount(value => value + 1)
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="vault">
      <Button htmlType="button" onClick={getVaults}>
        Refresh Vaults
      </Button>
      <Divider />
      <List
        grid={{
          gutter: 16, column: 4
        }}
        dataSource={vaults}
        renderItem={item => (
            <List.Item>
              <Card style={{ width: '100%' }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Row><Title level={4}>TestCoin(TC)</Title></Row>
                </Col>
                <Col span>
                  <Row><Title level={5}>Locked Amount: {item.amount}</Title></Row>
                  <Row><Title level={5}>Init Amount: {item.initAmount}</Title></Row>
                  <Row><Title level={5}>Lock At: {item.lockAt}</Title></Row>
                  <Row><Title level={5}>Unlock At: {item.unlockAt}</Title></Row>
                  <Row><Title level={5}>PenaltyRatio: {item.penalty}</Title></Row>
                  <Row><Title level={5}>Status: {item.status}</Title></Row>
                </Col>
                <Col>
                  <Button onClick={() => { handleRedeem(item.index)} } size='large'>Redeem</Button>
                  <Button onClick={() => { handleForceRedeem(item.index)} } size='large'>ForceRedeem</Button>
                  <Button onClick={() => { handleClaim(item.index)} } size='large'>Claim</Button>
                </Col>
              </Row>
            </Card>
            </List.Item>

        )}
      />


    </div>
  )
}

export default Vaults;