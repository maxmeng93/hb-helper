// 监听安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log("扩展程序已安装");

  // 插件上显示徽章
  // chrome.action.setBadgeText({
  //   text: "ON",
  // });
});

// 记录已下载过的分页，避免重复下载
const downloadedPages = new Set();

// 将 Blob 转为 DataURL，用于在 Service Worker 中下载
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

chrome.webRequest.onCompleted.addListener(async (details) => {
  // 只处理目标请求
  if (!details.url.includes('/statuses/user_timeline.json')) return;

  try {
    const urlObj = new URL(details.url);
    const page = urlObj.searchParams.get("page") || "1";

    // 避免重复下载
    if (downloadedPages.has(page)) return;

    console.log(`📥 捕捉雪球请求，第 ${page} 页`);
    

    // 发起 fetch 请求，重新获取数据
    const response = await fetch(details.url, {
      credentials: 'include'
    });

    downloadedPages.add(page);

    const data = await response.json();
    const firstStatus = data.statuses?.[0] || {};
    const screen_name = firstStatus.user?.screen_name || "unknown";

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });

    const dataUrl = await blobToDataURL(blob) as string;

    chrome.downloads.download({
      url: dataUrl,
      filename: `${screen_name}_user_timeline_page_${page}.json`
    });



  } catch (e) {
    console.error("❌ 下载出错：", e);
  }

}, { urls: ["*://xueqiu.com/*"] });
