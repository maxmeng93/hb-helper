function getConfig() {
  const url = "https://www.maxmeng.top/data/hb-helper.json?t=" + Date.now();

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const version = data?.version;
      if (version) {
        document.getElementById("version").textContent = `V${version}`;
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function setVersion() {
  var manifestData = chrome.runtime.getManifest();
  var version = manifestData.version;
  document.getElementById("old-version").textContent = `V${version}`;
}

getConfig();
setVersion();
