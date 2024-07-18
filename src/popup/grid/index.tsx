import * as math from 'mathjs';
import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, InputNumber, Table } from 'antd';

const { add, subtract, multiply, divide, bignumber, number, round } = math;
interface GridPrice {
  level: number;
  buyTriggerPrice: number;
  buyPrice: number;
  sellTriggerPrice: number;
  sellPrice: number;
}

interface Grid {
  key: string;
  // 网格种类
  type: string;
  // 档位
  level: number;
  // 买入触发价
  buyTriggerPrice: number;
  // 买入价
  buyPrice: number;
  // 买入金额
  buyAmount: number;
  // 入股数
  buyStock: number;
  // 卖出触发价
  sellTriggerPrice: number;
  // 卖出价
  sellPrice: number;
  // 卖出金额
  sellStock: number;
  // 出股数
  sellAmount: number;
}

const Grid: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<Grid[]>([]);
  const mergeData = useRef({});

  useEffect(() => {
    form.submit();
  }, []);

  const columns = [
    {
      title: '网格种类',
      dataIndex: 'type',
      key: 'type',
      onCell: (_, index) => {
        const len = mergeData.current[index];
        if (len) return { rowSpan: len };
        return { rowSpan: 0 };
      },
    },
    {
      title: '档位',
      dataIndex: 'level',
      key: 'level',
      render: (v) => v.toFixed(2),
    },
    {
      title: '买入触发价',
      dataIndex: 'buyTriggerPrice',
      key: 'buyTriggerPrice',
      render: (v) => v.toFixed(3),
    },
    {
      title: '买入价',
      dataIndex: 'buyPrice',
      key: 'buyPrice',
      render: (v) => v.toFixed(3),
    },
    {
      title: '买入金额',
      dataIndex: 'buyAmount',
      key: 'buyAmount',
    },
    {
      title: '入股数',
      dataIndex: 'buyStock',
      key: 'buyStock',
    },
    {
      title: '卖出触发价',
      dataIndex: 'sellTriggerPrice',
      key: 'sellTriggerPrice',
      render: (v) => v.toFixed(3),
    },
    {
      title: '卖出价',
      dataIndex: 'sellPrice',
      key: 'sellPrice',
      render: (v) => v.toFixed(3),
    },
    {
      title: '出股数',
      dataIndex: 'sellStock',
      key: 'sellStock',
    },
    {
      title: '卖出金额',
      dataIndex: 'sellAmount',
      key: 'sellAmount',
    },
  ];

  const percentProps = {
    min: 0,
    max: 100,
    formatter: (value) => `${value}%`,
    parser: (value) => value?.replace('%', ''),
  };

  const getLevelPrice = (step, type: string) => {
    const { basePrice, minPrice } = form.getFieldsValue();
    // 最大跌幅
    const decline = number(divide(bignumber(minPrice), bignumber(basePrice)));

    const getLevel = (index) => {
      return number(
        subtract(1, multiply(index, divide(bignumber(step), 100))) as number,
      );
    };

    const arr: Grid[] = [];
    let index = 0;
    while (getLevel(index) >= decline) {
      const level = getLevel(index);
      const item = calcGridItemByLevel(basePrice, step, level);
      arr.push({
        key: `${type}-${level}`,
        type,
        buyAmount: 0,
        buyStock: 0,
        sellStock: 0,
        sellAmount: 0,
        ...item,
      });
      index++;
    }

    return arr;
  };

  // 根据基准价和档位计算网格每档的数据
  const calcGridItemByLevel = (basePrice, step, level) => {
    // 买入价
    const buyPrice = number(
      round(multiply(bignumber(basePrice), level), 3),
    ) as number;

    // 卖出价
    const sellPrice = number(
      round(
        multiply(
          bignumber(basePrice),
          add(level, divide(bignumber(step), 100)),
        ),
        3,
      ) as number,
    );

    return {
      level,
      buyPrice,
      buyTriggerPrice: getTriggerPrice(buyPrice, '+'),
      sellPrice,
      sellTriggerPrice: getTriggerPrice(sellPrice, '-'),
    };
  };

  const getTriggerPrice = (price: number, fun: '+' | '-', step = 0.005) => {
    if (fun === '+') {
      return number(add(price, bignumber(step)) as math.BigNumber);
    } else {
      return number(subtract(price, bignumber(step)) as math.BigNumber);
    }
  };

  const genGrid = (values) => {
    // 中网、大网过滤1档
    const fbp = (e) => e.level != 1;
    const { step, middleStep, bigStep } = values;

    const sPrice = getLevelPrice(step, '小网');
    const mPrice = getLevelPrice(middleStep, '中网').filter(fbp);
    const bPrice = getLevelPrice(bigStep, '大网').filter(fbp);

    const list = [sPrice, mPrice, bPrice].flat();

    mergeData.current = {
      0: sPrice.length,
      [sPrice.length]: mPrice.length,
      [sPrice.length + mPrice.length]: bPrice.length,
    };

    setData(list);
  };

  return (
    <div>
      <Form
        form={form}
        size="small"
        layout="inline"
        onFinish={genGrid}
        initialValues={{
          basePrice: 1,
          baseSum: 1000,
          minPrice: 0.5,
          step: 5,
          middleStep: 15,
          bigStep: 30,
        }}
      >
        <Form.Item
          label="基准价"
          name="basePrice"
          tooltip="第一份买入价"
          required
        >
          <InputNumber></InputNumber>
        </Form.Item>
        <Form.Item
          label="每份金额"
          name="baseSum"
          tooltip="第一份买入金额，不同档位的买入金额会乘一个系数"
          required
        >
          <InputNumber></InputNumber>
        </Form.Item>
        <Form.Item
          label="最低价"
          name="minPrice"
          tooltip="低于此价不会再买入"
          required
        >
          <InputNumber></InputNumber>
        </Form.Item>
        <Form.Item
          label="步长"
          name="step"
          tooltip="跌多少个百分点触发下一个档位"
          required
        >
          <InputNumber {...percentProps}></InputNumber>
        </Form.Item>
        <Form.Item label="中网步长" name="middleStep">
          <InputNumber {...percentProps}></InputNumber>
        </Form.Item>
        <Form.Item label="大网步长" name="bigStep">
          <InputNumber {...percentProps}></InputNumber>
        </Form.Item>
        <Button type="primary" htmlType="submit">
          生成网格
        </Button>
      </Form>
      <Table
        size="small"
        dataSource={data}
        columns={columns}
        pagination={false}
      ></Table>
    </div>
  );
};

export default Grid;
