// ==UserScript==
// @name         트위치 보너스 수확기
// @namespace    http://tampermonkey.net/
// @version      1.0.3
// @description  twitch-bonus-harvest
// @author       You
// @match        https://www.twitch.tv/*
// @icon         https://www.twitch.tv/favicon.ico
// @grant        none
// ==/UserScript==

(async () => {
  const settings = {
    title: "보너스 수확기",
    query: '[aria-label="보너스 받기"]',
    enable: true,
    boxCoolTime: 15, // minutes,
    containerClassName: "chat-input__buttons-container"
  }

  const timerStyle = {
    "display": "inline-flex",
    "justify-content": "center",
    "align-items": "center",
    "margin-left": "5px",
    "margin-right": "auto",
    "color": "pink"
  };

  const MILLISECOND = 1;
  const SECOND = 1000 * MILLISECOND;
  const MINUTE = 60 * SECOND;

  class Timer {
    constructor(minutes, seconds=0) {
      this.reset(minutes, seconds);
    }

    reset(minutes, seconds=0) {
      this.inner = minutes * MINUTE;
      this.inner += seconds * SECOND;
    }

    toString() {
      const minutes = Math.floor(this.inner / MINUTE);
      const seconds = Math.floor(this.inner % MINUTE / SECOND);
      const formmatedSeconds = seconds > 9 ? "" + seconds : "0" + seconds;
      return `${minutes}:${formmatedSeconds}`;
    }

    subtract(seconds=1) {
      this.inner -= seconds * SECOND;
      if (this.inner < 0) {
        this.inner = 0;
      }
      return this.inner;
    }
  }

  function now() {
    const today = new Date();
    today.setHours(today.getHours() + 9);
    return today.toISOString().replace('T', ' ');
  }

  async function delay(n) {
    await new Promise(r => setTimeout(r, n * SECOND));
  }

  function findContainer() {
    const containerList = document.getElementsByClassName(settings.containerClassName);
    if (containerList.length) {
      return containerList[0]
    }
  }

  function makeTimerElement() {
    const e = document.createElement("div");
    Object.entries(timerStyle)
      .map(([propertyName, propertyValue]) => e.style.setProperty(propertyName, propertyValue));
    return e;
  }

  function join(container) {
    return (element) => {
      if (!container || !element) {
        return element;
      }
      const before = container.firstChild;
      before.after(element);
      return element;
    }
  }

  function setInnerText(text) {
    return (element) => {
      if (!element) {
        return element;
      }
      if (typeof element.innerText === 'undefined') {
        return element;
      }
      element.innerText = text;
      return element;
    }
  }

  function remove(element) {
    if (element && element.remove) {
      element.remove();
    }
  }

  function logNowAndReturn(obj) {
    console.log(`found bonus ${now()}`);
    return obj;
  }

  function click(obj) {
    obj.click();
    return obj;
  }

  function clickAllElementsByQuery(query) {
    const nodeList = document.querySelectorAll(query);
    Array.from(nodeList.values())
        .map(logNowAndReturn)
        .map(click);
    return nodeList.length;
  }

  async function run(settings) {
    console.log(`${settings.title} start ${now()}`);

    const timer = new Timer(settings.boxCoolTime);
    let timerElementOption = [undefined];
    let url;

    while(true) {
      timer.subtract();

      const container = findContainer();

      timerElementOption = timerElementOption.map(remove)
          .map(makeTimerElement)
          .map(setInnerText(timer.toString()))
          .map(join(container));

      const currentUrl = window.location.href;
      if (url !== currentUrl) {
        timer.reset(settings.boxCoolTime);
      }
      url = currentUrl;

      const size = clickAllElementsByQuery(settings.query);
      if (size) {
        timer.reset(settings.boxCoolTime);
      }

      await delay(1);
    }
  }

  run(settings);
})();