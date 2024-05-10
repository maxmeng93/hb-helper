// https://developer.chrome.com/docs/extensions/mv3/architecture-overview/
// https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/api-samples/bookmarks/popup.js

// 刷新弹出窗口
// location.reload();

document.getElementById("hb").addEventListener("click", function () {
  const url = "https://m.touker.com/fd/conditions/monitoring";
  chrome.tabs.create({ url });
});
