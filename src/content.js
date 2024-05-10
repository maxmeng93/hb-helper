const CHECK_DEADLINE = 'CHECK_DEADLINE';
const CHANGE_DEADLINE = 'CHANGE_DEADLINE';
const SUBMIT_ORDER = 'SUBMIT_ORDER';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'postpone') {
    checkDeadline();
  }
});

window.addEventListener('load', function () {
  chrome.storage.local.get('state', function (data) {
    // 检查截止日期
    if (data.state === CHECK_DEADLINE) {
      checkDeadline();
    }

    // 修改截止日期
    if (data.state === CHANGE_DEADLINE) {
      setTimeout(() => {
        let eles = document.querySelectorAll('.deadline-card .quick-label');
        const last = eles[eles.length - 1].querySelector('.time-select-btn');
        last.click();

        const submit = document.querySelector('.submit-condition>input');
        submit.click();
        setState(SUBMIT_ORDER);
      }, 1000);
    }

    // 提交订单
    if (data.state === SUBMIT_ORDER) {
      const checkbox = document.querySelector('#onlyTg');
      if (!checkbox.checked) submit.click();

      document.querySelector('#btnSubmit').click();
      setState(CHECK_DEADLINE);
    }
  });
});

function setState(value) {
  chrome.storage.local.set({ 'state': value });
}


function checkDeadline() {
  let elements = document.querySelectorAll('.monitor-item');
  const dates = [];
  for (let element of elements) {
    let expireDate = element.querySelector('.expire-date');
    const date = expireDate.textContent.replace('截止日期：', '');
    dates.push(date);
  }

  const now = new Date();
  const weekends = 4;
  const weekdays = 5;

  for (let date of dates) {
    const expireDate = new Date(date);
    const diff = expireDate.getTime() - now.getTime();

    const days = Math.floor(diff / (24 * 3600 * 1000));
    const weeks = Math.floor(days / weekdays);
    const remain = days % weekdays;
    const total = weeks * weekends + remain;
    if (total <= 20) {
      console.log('延期', date)
      let ele = document.querySelectorAll('.monitor-item')[0];
      // ele.querySelector('.main').click();
      // ele.querySelector('.opr').click();

      const options = ele.querySelector('.opr').querySelectorAll('i');
      for (let option of options) {
        if (option.textContent === '延期') {
          option.click();

          setState(CHANGE_DEADLINE);
          break;
        }
      }
      return;
    }
  }
}
