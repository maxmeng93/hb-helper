// https://developer.chrome.com/docs/extensions/mv3/architecture-overview/
// https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/api-samples/bookmarks/popup.js

// 刷新弹出窗口
// location.reload();

const url = "https://m.touker.com/fd/conditions/monitoring";

document.getElementById("hb").addEventListener("click", function () {
  chrome.tabs.create({ url });
});

document.getElementById('postpone').addEventListener('click', function () {

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'postpone' });
  });
});