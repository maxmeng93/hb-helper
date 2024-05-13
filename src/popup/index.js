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

function setVersion() {
  var manifestData = chrome.runtime.getManifest();
  var version = manifestData.version;
  document.getElementById("version").textContent = `V${version}`;
}

function addEvent() {
  document
    .querySelector("#go-to-options")
    .addEventListener("click", function () {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL("options.html"));
      }
    });

  // 打开华宝
  document.getElementById("hb").addEventListener("click", function () {
    chrome.tabs.create({ url });
  });

  // 单个延期
  document
    .getElementById("postpone-single")
    .addEventListener("click", function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "postpone-single" });
      });
    });

  // 批量延期
  document
    .getElementById("postpone-multiple")
    .addEventListener("click", function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "postpone-multiple" });
      });
    });

  // 停止延期
  document
    .getElementById("postpone-stop")
    .addEventListener("click", function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        console.log("stop123");
        chrome.tabs.sendMessage(tabs[0].id, { action: "postpone-stop" });
      });
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