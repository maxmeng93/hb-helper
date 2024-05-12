// 缓存前缀
const PREFIX = "hb-helper";
// 检查截止日期
const CHECK_DEADLINE = "CHECK_DEADLINE";
// 修改截止日期
const CHANGE_DEADLINE = "CHANGE_DEADLINE";
// 提交订单
const SUBMIT_ORDER = "SUBMIT_ORDER";

const single = "postpone-single";
const multiple = "postpone-multiple";

const stateCache = "state";
const postponeTypeCache = "postpone-type";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === single || request.action === multiple) {
    setLocalStorage(postponeTypeCache, request.action);
    checkDeadline();
  }
});

window.addEventListener("load", function () {
  checkState();
});

function delay(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

function setLocalStorage(key, value) {
  const dataKey = `${PREFIX}-${key}`;
  chrome.storage.local.set({ [dataKey]: value });
}

function getLocalStorage(key) {
  const dataKey = `${PREFIX}-${key}`;
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(dataKey, function (data) {
      resolve(data[dataKey]);
    });
  });
}

async function checkState() {
  try {
    const state = await getLocalStorage(stateCache);

    // 检查截止日期
    if (state === CHECK_DEADLINE) {
      const postponeType = await getLocalStorage(postponeTypeCache);
      if (postponeType === single) return;
      await delay(1000);
      checkDeadline();
    }

    // 修改截止日期
    if (state === CHANGE_DEADLINE) {
      await delay(1000);
      let eles = document.querySelectorAll(".deadline-card .quick-label");
      const last = eles[eles.length - 1].querySelector(".time-select-btn");
      last.click();

      const submit = document.querySelector(".submit-condition>input");
      submit.click();
      setLocalStorage(stateCache, SUBMIT_ORDER);
    }

    // 提交订单
    if (state === SUBMIT_ORDER) {
      await delay(1000);
      const checkbox = document.querySelector("#onlyTg");
      if (!checkbox) return;
      if (!checkbox.checked) checkbox.click();

      document.querySelector("#btnSubmit").click();
      setLocalStorage(stateCache, CHECK_DEADLINE);
    }
  } catch (error) {
    setLocalStorage(stateCache, "");
  }
}

function checkDeadline() {
  let elements = document.querySelectorAll(".monitor-item");
  const dates = [];
  for (let element of elements) {
    let expireDate = element.querySelector(".expire-date");
    const date = expireDate.textContent.replace("截止日期：", "");
    dates.push(date);
  }

  const now = new Date();

  for (let date of dates) {
    const index = dates.indexOf(date);
    const expireDate = new Date(date);
    const diff = expireDate.getTime() - now.getTime();
    const days = Math.floor(diff / (24 * 3600 * 1000));

    if (days <= 21) {
      let ele = document.querySelectorAll(".monitor-item")[index];

      const options = ele.querySelector(".opr").querySelectorAll("i");
      for (let option of options) {
        if (option.textContent === "延期") {
          option.click();

          setLocalStorage(stateCache, CHANGE_DEADLINE);
          break;
        }
      }
      return;
    }
  }
  setLocalStorage(stateCache, "");
}
