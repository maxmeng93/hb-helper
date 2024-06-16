import React, { useEffect, useState } from "react";
import { Button, Row, Col, Modal } from "antd";
import "./index.scss";

const hb = "https://m.touker.com";
const url = "https://m.touker.com/fd/conditions/monitoring";

const Hb: React.FC = () => {
  const [time, setTime] = useState("");
  const [show, setShow] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [stopDisabled, setStopDisabled] = useState(true);

  useEffect(() => {
    getConfig();
    checkIsHb();
  }, []);

  const checkIsHb = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length === 0) return;
      const tab = tabs[0];
      const curUrl = tab?.url || "";

      if (curUrl.startsWith(url)) {
        setDisabled(false);
      }

      if (curUrl.startsWith(hb)) {
        setStopDisabled(false);
      }
    });
  };

  const getConfig = () => {
    const url = "https://www.maxmeng.top/data/hb-helper.json?t=" + Date.now();

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const time = data?.grid_update_time;
        if (time) setTime(time);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const openHbPage = () => {
    chrome.tabs.create({ url });
  };

  const postpone = (action: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const [tab] = tabs as chrome.tabs.Tab[];
      if (!tab) return;
      chrome.tabs.sendMessage(tab.id as number, { action: action });
    });
  };

  return (
    <div className="hb">
      <Row className="btn-wrap" gutter={[8, 8]}>
        <Col span={12}>
          <Button ghost type="primary" onClick={openHbPage}>
            查看条件单
          </Button>
        </Col>
        <Col span={12}>
          <Button
            ghost
            type="primary"
            disabled={disabled}
            onClick={() => postpone("postpone-single")}
          >
            自动延期(单个)
          </Button>
        </Col>
        <Col span={12}>
          <Button
            ghost
            type="primary"
            disabled={disabled}
            onClick={() => postpone("postpone-multiple")}
          >
            自动延期(多个)
          </Button>
        </Col>
        <Col span={12}>
          <Button
            ghost
            danger
            type="primary"
            disabled={stopDisabled}
            onClick={() => postpone("postpone-stop")}
          >
            停止延期
          </Button>
        </Col>
      </Row>
      <ul className="info">
        <li>
          <span>华宝网格策略更新时间：</span>
          <span className="time">{time}</span>
          <a href="#" onClick={() => setShow(true)}>
            查看
          </a>
          {show ? (
            <div id="hb-grid-wrap" onClick={() => setShow(false)}>
              <img src="../../images/hb-grid.png" alt="华宝网格策略" />
            </div>
          ) : null}
        </li>
      </ul>
    </div>
  );
};

export default Hb;
