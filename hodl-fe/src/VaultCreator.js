import React from 'react';
import { Form, Input, Select, Button, InputNumber } from 'antd';
import { useWeb3React } from '@web3-react/core'

import { ethers } from 'ethers';
import * as erc20ABI from './erc20_abi.json';
import * as hodlABI from './hodl_abi.json';
import { tokenContract, hodlContract } from './contracts'

const VaultCreator = (props) => {

  // data
  const { account, library, chainId, active } = useWeb3React()
  const [balance, setBalance] = React.useState("Unknown")

  const token = new ethers.Contract(tokenContract, erc20ABI.default, library)
  const vault = new ethers.Contract(hodlContract, hodlABI.default, library)

  React.useEffect(() => {
    if (active) {
      getTokenBalance()
    } else {
      setBalance("Unknown")
    }
  })

  const getTokenBalance = async () => {
    try {
      const balance = await token.balanceOf(account)
      const decimals = await token.decimals()
      const formatted = ethers.utils.formatUnits(balance, decimals)
      setBalance(formatted)
    } catch (e) {
      setBalance("Unknown")
    }
  }

  // interaction
  const handleApprove = async () => {
    const signer = token.connect(library.getSigner())
    try {
      const tx = await signer.approve(hodlContract, ethers.constants.MaxUint256)
      alert(`Transaction created: ${tx['hash']}`)
      await tx.wait()
      alert(`Transaction confirmed: ${tx['hash']}`)
    } catch (e) {
      alert(e.message)
    }
  }

  const onFinish = async (values) => {
    const decimals = await token.decimals() 
    const amount = ethers.utils.parseUnits(values.amount, decimals)
    try {
      const currentAllowance = await token.allowance(account, hodlContract)
      if (currentAllowance.isZero() || currentAllowance.lt(amount)) {
        alert(`Please approve Hodl spent your TestCoin. Allowance should be greater than ${amount.toString()}`)
      } else {
        let lockWindow = 10
        if (values.lock_window == '10 seconds') {
          lockWindow = 10
        } else if (values.lock_window == '1 week') {
          lockWindow = 60 * 60 * 24 * 7
        } else if (values.lock_window == '1 month') {
          lockWindow = 60 * 60 * 24 * 30
        }
        let penaltyRatio = values.penalty_ratio
        const signer = vault.connect(library.getSigner())
        const tx = await signer.lock(amount, lockWindow, penaltyRatio)
        alert(`Transaction created: ${tx['hash']}`)
        await tx.wait()
        alert(`Transaction confirmed: ${tx['hash']}`)
      }
    } catch (e) {
      alert(e.message)
    }
  };

  // style 
  const { Option } = Select;
  const [form] = Form.useForm();
  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 16,
    },
  };

  const tailLayout = {
    wrapperCol: {
      offset: 8,
      span: 16,
    },
  };

  return (
    <div className="vaultCreator">
    <label>{props.count}</label>
    <Form {...layout} 
      form={form} 
      name="control-hooks" 
      onFinish={onFinish} 
      initialValues={{
          ["PenaltyRatio"]: 100
      }}>
      <Form.Item
        name="amount"
        label="Amount"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input 
          placeholder={`Current Balance is ${balance}`}
        />
      </Form.Item>

      <Form.Item
        name="lock_window"
        label="LockWindow"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Select
          placeholder="Select a period you want to lock"
          allowClear
        >
          <Option value="10 seconds">10 seconds</Option>
          <Option value="1 day">1 week</Option>
          <Option value="1 month">1 month</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="penalty_ratio"
        label="Penalty Ratio"
        rules={[{required: true}]}

      >
        <InputNumber
          min={0}
          max={100}
          formatter={value => `${value}%`}
          parser={value => value.replace('%', '')}
        />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Button htmlType="button" onClick={handleApprove}>
          1. Approve TestCoin
        </Button>
        <Button type="primary" htmlType="submit">
          2. Create Vault
        </Button>
      </Form.Item>
    </Form>
    </div>
  )
}

export default VaultCreator;


