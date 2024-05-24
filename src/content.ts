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
const postponeStop = "postpone-stop";

const stopCache = "stop";
const stateCache = "state";
const postponeTypeCache = "postpone-type";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const action = request.action;

  switch (action) {
    case single:
    case multiple:
      const orders = getOrders();
      if (orders.length === 0) {
        alert(
          "没有符合延期条件的的订单。\n本插件暂时只延期截止日期在20天内的条件单。"
        );
        return;
      }
      setLocalStorage(postponeTypeCache, action);
      checkDeadline(orders);
      break;
    case postponeStop:
      setLocalStorage(stopCache, "true");
      break;
    default:
      break;
  }
});

window.addEventListener("load", function () {
  checkState();
});

function delay(time: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}

function setLocalStorage(key: string, value: string) {
  const dataKey = `${PREFIX}-${key}`;
  chrome.storage.local.set({ [dataKey]: value });
}

function getLocalStorage(key: string) {
  const dataKey = `${PREFIX}-${key}`;
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(dataKey, function (data) {
      resolve(data[dataKey]);
    });
  });
}

async function checkState() {
  try {
    const isStop = await getLocalStorage(stopCache);
    if (isStop) {
      setLocalStorage(stopCache, "");
      setLocalStorage(stateCache, "");
      return;
    }

    const state = await getLocalStorage(stateCache);

    // 检查截止日期
    if (state === CHECK_DEADLINE) {
      const postponeType = await getLocalStorage(postponeTypeCache);
      if (postponeType === single) return;
      await delay(1000);
      const orders = getOrders();
      checkDeadline(orders);
    }

    // 修改截止日期
    if (state === CHANGE_DEADLINE) {
      await delay(1000);
      let eles = document.querySelectorAll(".deadline-card .quick-label");
      const last = eles[eles.length - 1].querySelector(".time-select-btn");
      // @ts-ignore
      last.click();

      const submit = document.querySelector(".submit-condition>input");
      // @ts-ignore
      submit.click();
      setLocalStorage(stateCache, SUBMIT_ORDER);
    }

    // 提交订单
    if (state === SUBMIT_ORDER) {
      await delay(1000);
      const checkbox = document.querySelector("#onlyTg");
      if (!checkbox) return;
      // @ts-ignore
      if (!checkbox.checked) checkbox.click();

      // @ts-ignore
      document.querySelector("#btnSubmit").click();
      setLocalStorage(stateCache, CHECK_DEADLINE);
    }
  } catch (error) {
    setLocalStorage(stateCache, "");
  }
}

function checkDeadline(orders: any[]) {
  for (let order of orders) {
    let ele = document.querySelectorAll(".monitor-item")[order.index];

    // @ts-ignore
    const options = ele.querySelector(".opr").querySelectorAll("i") || [];
    // @ts-ignore
    for (let option of options) {
      if (option.textContent === "延期") {
        option.click();

        setLocalStorage(stateCache, CHANGE_DEADLINE);
        break;
      }
    }
    return;
  }

  setLocalStorage(stateCache, "");
}

function getOrders() {
  const list = [];
  let elements = document.querySelectorAll(".monitor-item");

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    let expireDate = element.querySelector(".expire-date");
    // @ts-ignore
    const date = expireDate.textContent.replace("截止日期：", "");
    if (isMatch(date)) list.push({ date, index: i });
  }

  return list;
}

function isMatch(date: string) {
  const now = new Date();
  const expireDate = new Date(date);
  const diff = expireDate.getTime() - now.getTime();
  const days = Math.floor(diff / (24 * 3600 * 1000));
  return days <= 21;
}
