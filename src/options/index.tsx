import { createRoot } from "react-dom/client";
import React, { useEffect, useState } from "react";
import "./index.scss";

const Options: React.FC = () => {
  const [version, setVersion] = useState("");
  const [curVersion, setCurVersion] = useState("");

  useEffect(() => {
    getConfig();
    getCurVersion();
  }, []);

  function getConfig() {
    const url = "https://www.maxmeng.top/data/hb-helper.json?t=" + Date.now();

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const version = data?.version;
        if (version) {
          setVersion(version);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function getCurVersion() {
    let manifestData = chrome.runtime.getManifest();
    let version = manifestData.version;
    setCurVersion(version);
  }

  return (
    <div id="main">
      <div>
        <h2>最新版本：</h2>
        <div className="version">V{version}</div>
      </div>
      <div>
        <h2>当前版本：</h2>
        <div className="version">V{curVersion}</div>
      </div>
      <div>
        <h2>更新日志：</h2>
        <a
          target="_blank"
          href="https://github.com/maxmeng93/hb-helper/blob/main/CHANGELOG.md"
        >
          查看
        </a>
      </div>
      <div>
        <h2>使用教程：</h2>
        <ul>
          <li>
            <a
              target="_blank"
              href="https://www.youtube.com/watch?v=i3udYwTsT0E"
            >
              YouTube
            </a>
          </li>
          <li>
            <a
              target="_blank"
              href="https://www.bilibili.com/video/BV1ps421P7Hz"
            >
              bilibili
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h2>联系方式：</h2>
        <div>
          <img src="../../images/wx.jpg" alt="微信" />
          <img src="../../images/gzh.jpg" alt="公众号" />
        </div>
      </div>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<Options />);
