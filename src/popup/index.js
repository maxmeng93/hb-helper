// https://github.com/crxjs/chrome-extension-tools
// https://developer.chrome.com/docs/extensions/mv3/architecture-overview/
// https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/api-samples/bookmarks/popup.js

const hb = "https://m.touker.com";
const url = "https://m.touker.com/fd/conditions/monitoring";

window.onload = () => {
  setVersion();
  addEvent();
  checkIsHb();
};

function getElement(selector) {
  return document.querySelector(selector);
}

function setVersion() {
  var manifestData = chrome.runtime.getManifest();
  var version = manifestData.version;
  getElement("#version").textContent = `V${version}`;
}

function addEvent() {
  getElement("#go-to-options").addEventListener("click", function () {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  });

  // 打开华宝
  getElement("#hb").addEventListener("click", function () {
    chrome.tabs.create({ url });
  });

  // 单个延期
  getElement("#postpone-single").addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "postpone-single" });
    });
  });

  // 批量延期
  getElement("#postpone-multiple").addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "postpone-multiple" });
    });
  });

  // 停止延期
  getElement("#postpone-stop").addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "postpone-stop" });
    });
  });

  // 显示华宝网格二维码
  getElement("#show-hb-grid").addEventListener("click", function () {
    getElement("#hb-grid-wrap").style.display = "block";
  });

  // 隐藏华宝网格二维码
  getElement("#hb-grid-wrap").addEventListener("click", function () {
    getElement("#hb-grid-wrap").style.display = "none";
  });
}

function checkIsHb() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length === 0) return;
    const tab = tabs[0];

    // 延期按钮
    const list = document.getElementsByClassName("postpone");
    if (tab.url.startsWith(url)) {
      for (let item of list) {
        item.disabled = false;
      }
    } else {
      for (let item of list) {
        item.disabled = true;
      }
    }

    // 停止按钮
    const stopBtn = document.getElementById("postpone-stop");
    if (tab.url.startsWith(hb)) {
      stopBtn.disabled = false;
    } else {
      stopBtn.disabled = true;
    }
  });
}

function getConfig() {
  const url = "https://www.maxmeng.top/data/hb-helper.json?t=" + Date.now();

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      console.log("data", data);
      const time = data?.grid_update_time;
      if (time) {
        getElement("#grid-update-time").textContent = time;
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

getConfig();
