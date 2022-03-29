// ==UserScript==
// @name         보너스 수확기
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  twitch-bonus-harvest
// @author       You
// @match        https://www.twitch.tv/*
// @icon         https://www.twitch.tv/favicon.ico
// @grant        none
// ==/UserScript==

const settings = {
  title: "보너스 수확기",
  query: '[aria-label="보너스 받기"]',
  interval: 1000,
  healthCheckCount: 60,
  count: 0,
  enable: true,
}

function stop() {
  settings.enable = false;
}

function now() {
  const today = new Date();
  today.setHours(today.getHours() + 9);
  return today.toISOString().replace('T', ' ');
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
  const interval = setInterval(() => {
      if (!settings.enable) {
          clearInterval(interval);
      }
      const nodeList = document.querySelectorAll(settings.query);
      Array.from(nodeList.values())
          .map(logNowAndReturn)
          .map(click);
      // if (config.count % config.healthCheckCount == 0) {
      //     console.log(`${config.title} ${now()}`);
      // }
      // config.count++;
  }, settings.interval);
}

run(settings);
