import * as math from 'mathjs';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Button,
  Form,
  InputNumber,
  Table,
  Tooltip,
  Row,
  Col,
  message,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import './index.scss';

const { create, all, add, pow, divide, number, round } = math;

const { evaluate } = create(all, {
  number: 'BigNumber',
});

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
  // 出股数
  sellStock: number;
  // 卖出金额
  sellAmount: number;
}

/**
 * 数学计算
 * @param str 表达式
 * @param roundN 四舍五入的位数
 * @returns 计算结果
 */
const calc = (str: string, roundN?: number): number => {
  let d = evaluate(str);
  if (roundN) d = round(d, roundN);
  return number(d);
};

const Grid: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<Grid[]>([]);
  const mergeData = useRef({});

  useEffect(() => {
    form.submit();
  }, []);

  const d = useMemo(() => {
    const { basePrice } = form.getFieldsValue();
    if (data.length === 0) return null;
    let buyAmount = 0;
    let buyStock = 0;
    let sellAmount = 0;
    let sellStock = 0;

    data.forEach((item) => {
      // buyAmount += item.buyAmount;
      buyAmount = calc(`${buyAmount} + ${item.buyAmount}`);
      buyStock += item.buyStock;
      // sellAmount += item.sellAmount;
      sellAmount = calc(`${sellAmount} + ${item.sellAmount}`);
      sellStock += item.sellStock;
    });
    const surplusStock = calc(`${buyStock} - ${sellStock}`);
    const profit = calc(
      `${sellAmount} - ${buyAmount} + ${surplusStock} * ${basePrice}`,
    );
    // 利润率
    const profitRate = calc(`${profit} / ${buyAmount} * 100`, 2);

    return {
      buyAmount,
      buyStock,
      sellAmount,
      sellStock,
      surplusStock,
      profit,
      profitRate,
    };
  }, [data]);

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

  /**
   * 计算系数
   * @param {number} index - 输入的索引值，从0开始
   * @param {number} k - 控制增长的宽度参数
   * @param {number} a - 控制增长的速率参数
   * @returns {number} - 计算出的系数
   *
   * 调节参数以实现不同的效果：
   * 1. 开始增长更慢，后期加速更快：
   *    增大 k 的值。例如，将 k 设置为 30 或更大。
   *    增大 a 的值。例如，将 a 设置为 2.5 或更大。
   * 2. 整体增长平缓：
   *    减小 k 的值。例如，将 k 设置为 10 或更小。
   *    减小 a 的值。例如，将 a 设置为 1.5 或更小。
   */
  const calcCoefficient = (index, k = 3.5, a = 2) => {
    // 确保参数为大于0的数值
    if (k <= 0 || a <= 0) {
      throw new Error('参数 k 和 a 必须大于0');
    }

    // 使用指数增长公式计算系数
    const coefficient = add(1, pow(divide(index, k), a)) as number;

    // 将结果保留2位小数并转换为数字
    return number(round(coefficient, 2));
  };

  const getLevels = (step, type: string) => {
    if (step === 0) return [];

    const { basePrice, minPrice, baseAmount } = form.getFieldsValue();
    // 最大跌幅 = 最低价 / 基准价
    const decline = calc(`${minPrice} / ${basePrice}`);

    let index = 0;
    let level = 1;
    const levels: number[] = [];

    while (level >= decline) {
      levels.push(level);
      level = calc(
        `${level} - ${calc(`${step} / 100`)} * ${calcCoefficient(index)}`,
        2,
      );
      index++;
    }

    return levels.map((level, i) => {
      const preLevel = levels[i - 1] || level + step / 100;

      // 买入价、卖出价、买入触发价、卖出触发价
      const price = calcGridItemByLevel(basePrice, level, preLevel);
      const { buyPrice, sellPrice } = price;
      // 买入金额、买入股数、卖出金额、卖出股数
      const buySell = calcBuySell(baseAmount, level, buyPrice, sellPrice);

      return {
        key: `${type}-${level}`,
        type,
        level,
        ...buySell,
        ...price,
      };
    });
  };

  // 计算买入金额、入股数、卖出金额、出股数
  const calcBuySell = (baseAmount, level, buyPrice, sellPrice) => {
    // 最大买入金额
    const maxAmount = calc(`${baseAmount} * (1 - ${level} + 1)`);
    // 最大买入股数
    const maxStock = calc(`${maxAmount} / ${buyPrice}`);
    // 买入股数，向下取整到100的整数倍
    const buyStock = Math.floor(maxStock / 100) * 100;
    // 买入金额
    const buyAmount = calc(`${buyStock} * ${buyPrice}`);

    // 卖出股数
    let sellStock = calc(
      `${buyStock} * (1 - (${sellPrice} - ${buyPrice}) / ${sellPrice})`,
    );
    sellStock = Math.floor(sellStock / 100) * 100;
    sellStock = Math.max(sellStock, 100);
    // 卖出金额
    const sellAmount = calc(`${sellStock} * ${sellPrice}`);

    return {
      buyAmount,
      buyStock,
      sellAmount,
      sellStock,
    };
  };

  // 根据基准价和档位计算网格每档的数据
  const calcGridItemByLevel = (basePrice, level, preLevel) => {
    // 买入价 = 基准价 * 档位，保留3位小数
    const buyPrice = calc(`${basePrice} * ${level}`, 3);

    // 卖出价 = 基准价 * (前一个档位)，保留3位小数
    const sellPrice = calc(`${basePrice} * ${preLevel}`, 3);

    return {
      buyPrice,
      buyTriggerPrice: getTriggerPrice(buyPrice, '+'),
      sellPrice,
      sellTriggerPrice: getTriggerPrice(sellPrice, '-'),
    };
  };

  const getTriggerPrice = (price: number, fun: '+' | '-', step = 0.005) => {
    return calc(`${price} ${fun} ${step}`, 3);
  };

  const genGrid = (values) => {
    const { step, middleStep, bigStep, basePrice, baseAmount } = values;
    if (basePrice <= 0 || baseAmount <= 0) return;
    if (baseAmount / basePrice < 100) {
      message.warning('每份金额不够买入1手（100股）');
      return;
    }

    // 中网、大网过滤1档
    const fbp = (e) => e.level != 1;
    const sPrice = getLevels(step, '小网');
    const mPrice = getLevels(middleStep, '中网').filter(fbp);
    const bPrice = getLevels(bigStep, '大网').filter(fbp);

    const list = [sPrice, mPrice, bPrice].flat();

    mergeData.current = {
      0: sPrice.length,
      [sPrice.length]: mPrice.length,
      [sPrice.length + mPrice.length]: bPrice.length,
    };

    setData(list);
  };

  return (
    <div style={{ minWidth: 700 }}>
      <Form
        form={form}
        size="small"
        layout="inline"
        onFinish={genGrid}
        initialValues={{
          basePrice: 1,
          baseAmount: 1000,
          minPrice: 0.6,
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
          <InputNumber step="0.1"></InputNumber>
        </Form.Item>
        <Form.Item
          label="每份金额"
          name="baseAmount"
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
          <InputNumber step="0.1"></InputNumber>
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
      {d === null ? null : (
        <div className="result">
          <h2 style={{ marginBottom: 0 }}>压力测试与盈利测算</h2>
          <Row gutter={[8, 0]}>
            <Col span={6}>
              <p>买入金额：{d?.buyAmount}</p>
            </Col>
            <Col span={6}>
              <p>买入股数：{d?.buyStock}</p>
            </Col>
            <Col span={6}>
              <p>卖出金额：{d?.sellAmount}</p>
            </Col>
            <Col span={6}>
              <p>卖出股数：{d?.sellStock}</p>
            </Col>
            <Col span={6}>
              <p>剩余股数：{d?.surplusStock}</p>
            </Col>
            <Col span={6}>
              <p>
                利润&nbsp;
                <Tooltip title="利润 = 卖出金额 - 买入金额 + 剩余股数 * 基准价">
                  <QuestionCircleOutlined className="icon" />
                </Tooltip>
                ：{d?.profit}
              </p>
            </Col>
            <Col span={6}>
              <p>利润率：{d?.profitRate}%</p>
            </Col>
          </Row>
        </div>
      )}
      <div className="article">
        <h2 style={{ marginBottom: 0 }}>E大网格三篇</h2>
        <ul>
          <li>
            <a
              href="https://mp.weixin.qq.com/s/uxktt5ZpNo03FpQQX-aG7g"
              target="_blank"
            >
              1. 波段策略.网格之一：写在前面、体系以及策略
            </a>
          </li>
          <li>
            <a
              href="https://mp.weixin.qq.com/s/-czfqGvxkDcay_tSI1jv5g"
              target="_blank"
            >
              2. 波段策略.网格之二：网格策略基础/1.0版
            </a>
          </li>
          <li>
            <a
              href="https://mp.weixin.qq.com/s/8pRKsjiQSZzrmH-uWCkRLQ"
              target="_blank"
            >
              3. 波段策略.网格之三：网格策略进阶/2.0版
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Grid;
