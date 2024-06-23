import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from 'react';
import {
  LeftOutlined,
  RightOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import * as echarts from 'echarts';
import { Spin, Tooltip, Table } from 'antd';

// 基金
interface Item {
  code: string;
  name: string;
  points: Point[];
}

// 点位
interface Point {
  type: PointType;
  min: number;
  max: number;
  remark: string;
  date: string;
  url: string;
}

// 点位类型
enum PointType {
  // 正常
  normal = 0,
  // 支撑位
  support = 1,
  // 压力位
  pressure = 2,
}

const pointColor = {
  [PointType.normal]: '#91d5ff',
  [PointType.support]: '#73d13d',
  [PointType.pressure]: '#ff4d4f',
};

const pointText = {
  [PointType.normal]: '正常',
  [PointType.support]: '支撑',
  [PointType.pressure]: '压力',
};

interface IData {
  日期: string;
  开盘: number;
  收盘: number;
  最高: number;
  最低: number;
  成交量: number;
  成交额: number;
  振幅: number;
  涨跌幅: number;
  涨跌额: number;
  换手率: number;
}

const upColor = '#ec0000';
const upBorderColor = '#8A0000';
const downColor = '#00da3c';
const downBorderColor = '#008F28';

const KLineChart = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<Item[]>([]);
  const [index, setIndex] = useState<number>();
  const [current, setCurrent] = useState<Item>();
  const [data, setData] = useState<IData[]>([]);
  const [start, setStart] = useState(0);
  const chartRef = useRef(null);
  const title = useMemo(() => {
    return current ? `${current.name} - ${current.code}` : '';
  }, [current]);

  useEffect(() => {
    getList();
  }, []);

  useEffect(() => {
    if (list.length && index !== undefined) {
      setCurrent(list[index]);
    }
  }, [list, index]);

  useEffect(() => {
    setStart(0);
  }, [index]);

  useEffect(() => {
    if (current) {
      getData(current.code);
    }
  }, [current]);

  const getList = () => {
    const url =
      `https://www.maxmeng.top/data/index_zh_a_hist/points.json?t=` +
      Date.now();
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setList(data);
        if (data?.length) {
          setIndex(0);
        }
      });
  };

  const getData = (code) => {
    setLoading(true);
    const url =
      `https://www.maxmeng.top/data/index_zh_a_hist/converted_${code}.json?t=` +
      Date.now();

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const newData = data.map((item: string) => {
          // 日期,开盘,收盘,最高,最低,成交量,成交额,振幅,涨跌幅,涨跌额,换手率
          const [
            日期,
            开盘,
            收盘,
            最高,
            最低,
            成交量,
            成交额,
            振幅,
            涨跌幅,
            涨跌额,
            换手率,
          ] = item.split(',');
          return {
            日期,
            开盘: parseFloat(开盘),
            收盘: parseFloat(收盘),
            最高: parseFloat(最高),
            最低: parseFloat(最低),
            成交量: parseFloat(成交量),
            成交额: parseFloat(成交额),
            振幅: parseFloat(振幅),
            涨跌幅: parseFloat(涨跌幅),
            涨跌额: parseFloat(涨跌额),
            换手率: parseFloat(换手率),
          };
        });
        setData(newData);
      })
      .catch(() => {
        console.log(`查询指数历史数据出错: ${code}`);
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const processData = (data: IData[]) => {
    const categoryData: string[] = [];
    const values: any[][] = [];
    data.forEach((item: IData) => {
      categoryData.push(item.日期);
      values.push([item.开盘, item.收盘, item.最低, item.最高]);
    });
    return { categoryData, values };
  };

  useEffect(() => {
    const lastDate = data[data.length - 1]?.日期;

    const chart = echarts.init(chartRef.current);
    const { categoryData, values } = processData(data);

    const markLine: any[] = [];
    const markArea: any[] = [];
    if (current) {
      current.points?.forEach((point) => {
        const { date, min, max, type } = point;
        const color = pointColor[type];

        if (min === null && max === null) return;

        if (min === max) {
          const other = {
            label: {
              formatter: `${min}`,
            },
            lineStyle: {
              type: 'solid',
              color: color,
              width: 2,
            },
          };
          markLine.push([
            { ...other, coord: [date, min] },
            { ...other, coord: [lastDate, min] },
          ]);
        } else {
          const other = {
            label: {
              formatter: `${min}-${max}`,
            },
            itemStyle: {
              color: color,
            },
          };

          markArea.push([
            { ...other, coord: [date, min] },
            { ...other, coord: [lastDate, max] },
          ]);
        }
      });
    }

    const option = {
      grid: {
        top: '5%',
      },
      xAxis: {
        type: 'category',
        data: categoryData,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax',
      },
      yAxis: {
        scale: true,
        splitArea: {
          show: true,
        },
      },
      dataZoom: [
        {
          type: 'inside',
          start: start,
          end: 100,
        },
        {
          show: true,
          type: 'slider',
          top: '90%',
          start: start,
          end: 100,
        },
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      series: [
        {
          type: 'candlestick',
          name: '日K',
          data: values,
          itemStyle: {
            color: upColor,
            color0: downColor,
            borderColor: upBorderColor,
            borderColor0: downBorderColor,
          },
          markLine: {
            animation: false,
            symbol: ['none', 'none'],
            data: markLine,
          },
          markArea: {
            data: markArea,
          },
        },
      ],
    };

    chart.setOption(option);

    const handleResize = () => {
      chart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [start, current, data]);

  const pre = useCallback(() => {
    if (index === undefined) return;
    if (index === 0) {
      setIndex(list.length - 1);
    } else {
      setIndex(index - 1);
    }
  }, [index]);

  const next = useCallback(() => {
    if (index === undefined) return;
    if (index === list.length - 1) {
      setIndex(0);
    } else {
      setIndex(index + 1);
    }
  }, [index]);

  const calcStart = useCallback(
    (time: string) => {
      if (data.length === 0) return;
      const start = data[0].日期;
      const end = data[data.length - 1].日期;
      const diff = new Date(end).getTime() - new Date(start).getTime();
      const current = new Date(time).getTime() - new Date(start).getTime();
      const s = (current / diff) * 100;
      setStart(s);
    },
    [data],
  );

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 100,
      render: (date) => {
        return <a onClick={() => calcStart(date)}>{date}</a>;
      },
    },
    {
      title: '当日收盘',
      dataIndex: 'close',
      key: 'close',
      width: 90,
      render: (_, record) => {
        const { date } = record;
        const curDate = new Date(date);
        let print = 0;
        for (let i = 0; i < data.length; i++) {
          if (new Date(data[i].日期) <= curDate) {
            print = data[i].收盘;
          }
        }
        return print;
      },
    },
    {
      title: '关键点位',
      dataIndex: 'min',
      key: 'min',
      width: 100,
      render: (_, record) => {
        const { min, max } = record;
        if (!min && !max) return null;
        if (min === max) {
          return min;
        } else {
          return `${min}-${max}`;
        }
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 50,
      render: (type) => {
        return (
          <span style={{ color: pointColor[type] }}>{pointText[type]}</span>
        );
      },
    },
    {
      title: '原文',
      dataIndex: 'remark',
      key: 'remark',
      render: (_, record) => {
        const { remark, url } = record;
        return (
          <>
            <span>{remark}</span>
            {url ? (
              <a href={url} target="_blank">
                来源
              </a>
            ) : null}
          </>
        );
      },
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <LeftOutlined style={{ cursor: 'pointer' }} onClick={pre} />
        <h2 style={{ margin: '0 2em' }}>{title}</h2>
        <RightOutlined style={{ cursor: 'pointer' }} onClick={next} />
      </div>
      <Spin spinning={loading}>
        <div ref={chartRef} style={{ height: '300px', width: '700px' }} />
      </Spin>
      <div style={{ marginTop: '2em', marginBottom: '1em' }}>
        <strong style={{ fontSize: 16 }}>E大关键点位</strong>
        <Tooltip
          placement="right"
          color={'#fff'}
          title={
            <a href="https://wj.qq.com/s2/14815104/7142/" target="_blank">
              补充点位数据
            </a>
          }
        >
          <QuestionCircleOutlined style={{ marginLeft: '6px' }} />
        </Tooltip>
      </div>
      <Table
        size="small"
        columns={columns}
        pagination={false}
        rowKey={({ date, min }) => `${date}-$${min}-${Math.random() * 1000}`}
        dataSource={current?.points?.sort((a, b) => {
          const { date: dateA } = a;
          const { date: dateB } = b;
          return dateA > dateB ? -1 : 1;
        })}
      ></Table>
    </div>
  );
};

export default KLineChart;
