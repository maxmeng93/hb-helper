import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./index.scss";

const hb = "https://m.touker.com";
const url = "https://m.touker.com/fd/conditions/monitoring";

const Popup: React.FC = () => {
  const [version, setVersion] = useState("");
  const [time, setTime] = useState("");
  const [show, setShow] = useState(false);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    getVersion();
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

  const getVersion = () => {
    let manifestData = chrome.runtime.getManifest();
    let version = manifestData.version;
    if (version) setVersion(`V${version}`);
  };

  const openHbPage = () => {
    chrome.tabs.create({ url });
  };

  const openOptionsPage = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  };

  const postpone = (action: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const [tab] = tabs as chrome.tabs.Tab[];
      if (!tab) return;
      chrome.tabs.sendMessage(tab.id as number, { action: action });
    });
  };

  return (
    <div id="main">
      <header id="header">
        <h2>华宝条件单助手</h2>
      </header>
      <div id="container">
        <div id="btn-wrap">
          <button className="btn" id="hb" onClick={openHbPage}>
            查看条件单
          </button>
          <button
            id="postpone-single"
            className="btn postpone"
            disabled={disabled}
            onClick={() => postpone("postpone-single")}
          >
            自动延期(单个)
          </button>
          <button
            id="postpone-multiple"
            className="btn postpone"
            disabled={disabled}
            onClick={() => postpone("postpone-multiple")}
          >
            自动延期(多个)
          </button>
          <button
            id="postpone-stop"
            className="btn dangerous"
            disabled={disabled}
            onClick={() => postpone("postpone-stop")}
          >
            停止延期
          </button>
        </div>
        <ul id="info">
          <li>
            <span>网格策略更新时间：</span>
            <span id="grid-update-time">{time}</span>
            <a href="#" id="show-hb-grid" onClick={() => setShow(true)}>
              查看
            </a>
          </li>
        </ul>
      </div>
      <footer id="footer">
        <span id="version">{version}</span>
        <span id="go-to-options" onClick={openOptionsPage}>
          更多
        </span>
      </footer>
      {show ? (
        <div id="hb-grid-wrap" onClick={() => setShow(false)}>
          <img src="../../images/hb-grid.png" alt="华宝网格策略" />
        </div>
      ) : null}
    </div>
  );
};

ReactDOM.render(<Popup />, document.getElementById("root"));
