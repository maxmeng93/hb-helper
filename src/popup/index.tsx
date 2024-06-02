import { createRoot } from "react-dom/client";
import classnames from "classnames";
import React, { useEffect, useState } from "react";
import Hb from "./hb";
import Grid from "./grid";
import "./index.scss";

const types = [
  {
    label: "华宝条件单",
    value: "hb",
  },
  {
    label: "网格策略",
    value: "gird",
  },
];

const Popup: React.FC = () => {
  const [version, setVersion] = useState("");
  const [type, setType] = useState("hb");

  useEffect(() => {
    getVersion();
  }, []);

  const getVersion = () => {
    let manifestData = chrome.runtime.getManifest();
    let version = manifestData.version;
    if (version) setVersion(version);
  };

  const openOptionsPage = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  };

  return (
    <>
      <header className="header">
        <div className="left">
          <img className="logo" src="../images/logo/32x32.png" alt="LOGO" />
          <span className="title">ETF投资助手</span>
          <span className="version">{version}</span>
        </div>
        <div className="right">
          <span className="go-to-options" onClick={openOptionsPage}>
            更多
          </span>
        </div>
      </header>

      <main className="main">
        <div className="type-list">
          {types.map((item) => {
            return (
              <div
                key={item.value}
                className={classnames("type-item", {
                  active: type === item.value,
                })}
                onClick={() => setType(item.value)}
              >
                {item.label}
              </div>
            );
          })}
        </div>
        {type === "hb" ? <Hb></Hb> : null}
        {type === "gird" ? <Grid></Grid> : null}
      </main>
    </>
  );
};

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<Popup />);
