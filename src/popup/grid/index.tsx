import React, { useState, useEffect } from "react";
import { Button, Form, Input, InputNumber, Radio, Checkbox, Table } from "antd";

const Grid: React.FC = () => {
  const [data, setData] = useState([]);

  const columns = [
    {
      title: "档位",
      dataIndex: "level",
      key: "level",
    },
    {
      title: "买入触发价",
      dataIndex: "buyTriggerPrice",
      key: "buyTriggerPrice",
    },
    {
      title: "买入价",
      dataIndex: "buyPrice",
      key: "buyPrice",
    },
    {
      title: "买入金额",
      dataIndex: "buyAmount",
      key: "buyAmount",
    },
    {
      title: "入股数",
      dataIndex: "buyStock",
      key: "buyStock",
    },
    {
      title: "卖出触发价",
      dataIndex: "sellTriggerPrice",
      key: "sellTriggerPrice",
    },
    {
      title: "卖出价",
      dataIndex: "sellPrice",
      key: "sellPrice",
    },
    {
      title: "出股数",
      dataIndex: "sellStock",
      key: "sellStock",
    },
    {
      title: "卖出金额",
      dataIndex: "sellAmount",
      key: "sellAmount",
    },
  ];

  return (
    <div style={{ width: "700px" }}>
      <Form layout="inline">
        {/* <Form.Item label="ETF名称">
          <Input></Input>
        </Form.Item>
        <Form.Item label="ETF代码">
          <Input></Input>
        </Form.Item>
        <Form.Item label="当前价格">
          <Input></Input>
        </Form.Item> */}
        <Form.Item label="基准价" name="benchmarkPrice" required>
          <InputNumber></InputNumber>
        </Form.Item>
        <Form.Item label="每份金额" name="perShareAmount" required>
          <InputNumber></InputNumber>
        </Form.Item>
        <Form.Item label="最大跌幅" name="maxDrawdown" required>
          <InputNumber></InputNumber>
        </Form.Item>
        <Form.Item label="步长" name="stepSize" required>
          <InputNumber></InputNumber>
        </Form.Item>
        <Form.Item label="中网" name="middleGrid">
          <InputNumber></InputNumber>
        </Form.Item>
        <Form.Item label="大网" name="bigGrid">
          <InputNumber></InputNumber>
        </Form.Item>
      </Form>
      <Table size="small" dataSource={data} columns={columns}></Table>
    </div>
  );
};

export default Grid;
