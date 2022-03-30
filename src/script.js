// ==UserScript==
// @name         트위치 보너스 수확기
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  twitch-bonus-harvest
// @author       You
// @match        https://www.twitch.tv/*
// @icon         https://www.twitch.tv/favicon.ico
// @grant        none
// ==/UserScript==

(() => {
  const settings = {
    title: "보너스 수확기",
    query: '[aria-label="보너스 받기"]',
    enable: true,
    boxCoolTime: 15, // minutes
  }
  
  const timerStyle = {
    "display": "inline-flex",
    "justify-content": "center",
    "align-items": "center",
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
  
  function makeTimer() {
    const e = document.createElement("div");
    Object.entries(timerStyle)
      .map(([propertyName, propertyValue]) => e.style.setProperty(propertyName, propertyValue));
    const containerList = document.getElementsByClassName("chat-input__buttons-container");
    console.log(containerList);
    if (!containerList) {
      return e;
    }
    const container = containerList[0];
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
  
  function run(settings) {
    console.log(`${settings.title} start ${now()}`);
    const timerElement = makeTimer();
    const timer = new Timer(settings.boxCoolTime);
    const interval = setInterval(() => {
      timer.subtract();
      timerElement.innerText = timer.toString();
      const nodeList = document.querySelectorAll(settings.query);
      Array.from(nodeList.values())
          .map(logNowAndReturn)
          .map(click);
      if (nodeList.length) {
        timer.reset(settings.boxCoolTime);
      }
    }, SECOND);
  }
  
  run(settings);
})();