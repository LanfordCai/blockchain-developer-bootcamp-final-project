import React from 'react';
import { Form, Input, Select, Button, InputNumber } from 'antd';
import { useWeb3React } from '@web3-react/core'

import { ethers } from "ethers";
import * as erc20ABI from './erc20_abi.json';

const VaultCreator = (props) => {
  const onFinish = (values) => {
    console.log(values);
  };

  // data
  const { account, library, chainId, active } = useWeb3React()
  const [balance, setBalance] = React.useState("Unknown")

  const tokenContract = "0x91C538676eA5ca642fCcC386eAa8f0F7abcB3c2f"
  const token = new ethers.Contract(tokenContract, erc20ABI.default, library)

  React.useEffect(() => {
    if (active) {
      getTokenBalance()
    } else {
      setBalance("Unknown")
    }
  })

  const getTokenBalance = async () => {
    const balance = await token.balanceOf(account)
    const decimals = await token.decimals()
    const formatted = ethers.utils.formatUnits(balance, decimals)
    setBalance(formatted)
  }

  // interaction
  

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
        name="Amount"
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
        name="Lock Window"
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
          <Option value="1 minute">1 minute</Option>
          <Option value="1 day">1 day</Option>
          <Option value="1 week">1 week</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="PenaltyRatio"
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
        <Button type="primary" htmlType="submit">
          Create Vault
        </Button>
      </Form.Item>
    </Form>
    </div>
  )
}

export default VaultCreator;


