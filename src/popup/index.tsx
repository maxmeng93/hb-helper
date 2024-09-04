import { createRoot } from 'react-dom/client';
import classnames from 'classnames';
import React, { useEffect, useState, useMemo } from 'react';
import Hb from './hb';
import Grid from './grid';
import Points from './points';
import { compareVersionLatest } from '../utils';
import './index.scss';

const types = [
  {
    label: '华宝条件单',
    value: 'hb',
    component: Hb,
  },
  {
    label: '关键点位',
    value: 'points',
    component: Points,
  },
  {
    label: '网格策略',
    value: 'gird',
    component: Grid,
  },
];

interface Notice {
  content: string;
  url?: string;
}

const Popup: React.FC = () => {
  const [version, setVersion] = useState('');
  const [lastVersion, setLastVersion] = useState('');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [type, setType] = useState('hb');

  const isOld = useMemo(() => {
    if (!lastVersion || !version) return false;
    return compareVersionLatest(lastVersion, version) === 1;
  }, [lastVersion, version]);

  useEffect(() => {
    getVersion();
    getConfig();
  }, []);

  const getVersion = () => {
    let manifestData = chrome.runtime.getManifest();
    let version = manifestData.version;
    if (version) setVersion(version);
  };

  function getConfig() {
    const url = 'https://www.maxmeng.top/data/hb-helper.json?t=' + Date.now();

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const version = data?.version;
        const notices = data?.notices || [];
        if (version) {
          setLastVersion(version);
        }
        if (notices) {
          setNotices(notices);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const openOptionsPage = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  };

  return (
    <>
      <header className="header">
        <div className="left">
          <img className="logo" src="../images/logo/32x32.png" alt="LOGO" />
          <span className="title">ETF投资助手</span>
          <span
            className={classnames('version', {
              old: isOld,
            })}
          >
            {version}
          </span>
          {isOld && (
            <a href="https://github.com/maxmeng93/hb-helper" target="_blank">
              获取最新版
            </a>
          )}
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
                className={classnames('type-item', {
                  active: type === item.value,
                })}
                onClick={() => setType(item.value)}
              >
                {item.label}
              </div>
            );
          })}
        </div>
        {types.map((item) => {
          return type === item.value ? (
            <item.component key={item.value}></item.component>
          ) : null;
        })}
      </main>
      {notices.length > 0 ? (
        <footer className="footer">
          <ul>
            {notices.map((tip, index) => {
              return (
                <li key={index}>
                  <span>{`${index + 1}. ${tip.content} `}</span>
                  {tip.url ? (
                    <a href={tip.url} target="_blank">
                      [查看]
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </footer>
      ) : null}
    </>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<Popup />);
