import React from 'react'

import { Button, Row, Col, Typography } from 'antd';

const { Title } = Typography;

const Vault = () => {
  return (
    <div className="vault">

      <Row type="flex" justify="space-between" align="middle">
        <Col>
          <Row><Title level={2}>TC</Title></Row>
          <Row><Title level={4}>TESTCOIN</Title></Row>
        </Col>
        <Col span={8}>
          <Row><Title level={5}>Locked Amount: 100</Title></Row>
          <Row><Title level={5}>Unlock Date: 100</Title></Row>
          <Row><Title level={5}>PenaltyRatio: 20%</Title></Row>
        </Col>
        <Col>
          <Button onClick={() => {
            console.log("button1")
          }} size='large'>Add More
          </Button>
          <Button onClick={() => {
            console.log("button2")   
          }} size='large'>Redeem</Button>
          <Button onClick={() => {
            console.log("button3")
          }} size='large'>ForceRedeem</Button>
          <Button onClick={() => {
            console.log("button4")
          }} size='large'>Claim</Button>
        </Col>
      </Row>
    </div>
  )
}

export default Vault;