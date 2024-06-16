import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  LeftOutlined,
  RightOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import * as echarts from "echarts";
import { Spin, Tooltip } from "antd";

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

const upColor = "#ec0000";
const upBorderColor = "#8A0000";
const downColor = "#00da3c";
const downBorderColor = "#008F28";

const KLineChart = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<Item[]>([]);
  const [index, setIndex] = useState<number>();
  const [current, setCurrent] = useState<Item>();
  const [data, setData] = useState<IData[]>([]);
  const chartRef = useRef(null);
  const title = useMemo(() => {
    return current ? `${current.name} - ${current.code}` : "";
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
          ] = item.split(",");
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
      .catch((err) => {
        console.log(err);
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
    const normalColor = "#91d5ff";
    const supportColor = "#73d13d";
    const pressureColor = "#ff4d4f";

    const chart = echarts.init(chartRef.current);
    const { categoryData, values } = processData(data);

    let title = "";
    const markLine: any[] = [];
    const markArea: any[] = [];
    if (current) {
      title = `${current.name} - ${current.code}`;
      current.points?.forEach((point) => {
        let color = normalColor;
        if (point.type === PointType.support) {
          color = supportColor;
        } else if (point.type === PointType.pressure) {
          color = pressureColor;
        }
        const { min, max, type } = point;
        if (min === max) {
          markLine.push({
            yAxis: min,
            label: {
              formatter: `${min}`,
            },
            lineStyle: {
              type: "solid",
              color: color,
            },
          });
        } else {
          markArea.push([
            {
              yAxis: min,
              label: {
                formatter: `${min}-${max}`,
              },
              itemStyle: {
                color: color,
              },
            },
            {
              yAxis: max,
              itemStyle: {
                color: color,
              },
            },
          ]);
        }
      });
    }

    const option = {
      // title: {
      //   text: title,
      //   left: "center",
      // },
      grid: {
        top: "5%",
      },
      xAxis: {
        type: "category",
        data: categoryData,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: "dataMin",
        max: "dataMax",
      },
      yAxis: {
        scale: true,
        splitArea: {
          show: true,
        },
      },
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
        },
        {
          show: true,
          type: "slider",
          top: "90%",
          start: 0,
          end: 100,
        },
      ],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
      },
      series: [
        {
          type: "candlestick",
          name: "日K",
          data: values,
          itemStyle: {
            color: upColor,
            color0: downColor,
            borderColor: upBorderColor,
            borderColor0: downBorderColor,
          },
          markLine: {
            symbol: ["none", "none"],
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

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [current, data]);

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

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LeftOutlined style={{ cursor: "pointer" }} onClick={pre} />
        <h2 style={{ margin: "0 2em" }}>{title}</h2>
        <RightOutlined style={{ cursor: "pointer" }} onClick={next} />
      </div>
      <Spin spinning={loading}>
        <div ref={chartRef} style={{ height: "300px", width: "600px" }} />
      </Spin>
      <div style={{ marginTop: "2em" }}>
        <strong style={{ fontSize: 16 }}>关键点位</strong>
        <Tooltip
          placement="right"
          color={"#fff"}
          title={
            <a href="https://wj.qq.com/s2/14815104/7142/" target="_blank">
              补充点位数据
            </a>
          }
        >
          <QuestionCircleOutlined style={{ marginLeft: "6px" }} />
        </Tooltip>
      </div>
      <ul>
        {current?.points
          ?.sort((a, b) => {
            const { date: dateA } = a;
            const { date: dateB } = b;
            return dateA > dateB ? -1 : 1;
          })
          .map((p) => {
            const { min, max, date, remark, url } = p;
            return (
              <li key={`${current.code}-${min}-${max}`}>
                <a href={url} target="_blank" style={{ marginRight: "1em" }}>
                  {date}
                </a>
                <span>{remark}</span>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default KLineChart;
