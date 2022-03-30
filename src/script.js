// ==UserScript==
// @name         트위치 보너스 수확기
// @namespace    http://tampermonkey.net/
// @version      1.0.2
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
    "margin-left": "10px",
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

  async function findContainer() {
    while(true) {
      const containerList = document.getElementsByClassName(settings.containerClassName);
      if (containerList.length) {
        return containerList[0]
      }
      await delay(1);
    }
  }

  function makeTimer(container) {
    const e = document.createElement("div");
    Object.entries(timerStyle)
      .map(([propertyName, propertyValue]) => e.style.setProperty(propertyName, propertyValue));
    const before = container.firstChild;
    before.after(e);
    return e;
  }

  function logNowAndReturn(obj) {
    console.log(`found bonus ${now()}`);
    return obj;
  }

  function click(obj) {
    obj.click();
    return obj;
  }

  async function run() {
    const container = await findContainer();
    console.log(`${settings.title} start ${now()}`);

    const timerElement = makeTimer(container);
    const timer = new Timer(settings.boxCoolTime);

    while(true) {
      timer.subtract();
      timerElement.innerText = timer.toString();
      const nodeList = document.querySelectorAll(settings.query);
      Array.from(nodeList.values())
          .map(logNowAndReturn)
          .map(click);
      if (nodeList.length) {
        timer.reset(settings.boxCoolTime);
      }

      await delay(1);
    }
  }

  run();
})();