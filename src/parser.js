import puppeteer from "puppeteer";
import DataSaver from "./dataSaver.js";

import { getTextForPage, getSavingPath } from "./helpers.js";

export default class Parser {
  static viewportOptions = { width: 1920, height: 1080 };

  static screenshotOptions = {
    fullPage: true,
    type: "jpeg",
  };

  static MAX_ATTEMPTS_COUNT = 3;

  constructor(url, region, browser, page) {
    this.url = url;
    this.region = region;
    this.browser = browser;
    this.page = page;
    this.getText = getTextForPage(this.page);
  }

  static async init(url, region) {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.setViewport(this.viewportOptions);

    return new Parser(url, region, browser, page);
  }

  async destroy() {
    await this.browser.close();
  }

  async setCurrentRegion() {
    const changeRegionSelector = ".UiHeaderHorizontalBase_region__2ODCG";

    const regionElem = await this.page.$(changeRegionSelector);
    const region = await this.getText(regionElem);

    if (region.trim() === this.region) return;

    await this.page.waitForSelector(changeRegionSelector);
    await this.page.click(changeRegionSelector);

    const regionSelector = `.UiRegionListBase_list__cH0fK ::-p-text(${this.region})`;
    await this.page.waitForSelector(regionSelector);
    await this.page.click(regionSelector);

    await this.page.waitForNavigation();
  }

  async getCost(selector) {
    const costElems = await this.page.$$(selector);

    let cost;
    for (const costItem of costElems) {
      cost = await this.getText(costItem);
      if (cost.length !== 0) break;
    }

    return parseFloat(cost?.replaceAll(",", "."));
  }

  async screenshot(dirPath) {
    // Закрытие окна с просьбой входа в личный кабинет (чтобы не было на скриншоте)
    try {
      await this.page.click(".Tooltip_closeIcon__skwl0");
    } catch (err) {
      //
    }

    return this.page.screenshot({
      ...this.constructor.screenshotOptions,
      path: `${dirPath}/screenshot.jpg`,
    });
  }

  async saveDataAndScreenshot(data) {
    const dirPath = await getSavingPath(this.url, this.region);

    try {
      await Promise.allSettled([
        new DataSaver(dirPath, data).save(),
        this.screenshot(dirPath),
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  async start() {
    console.log("Парсинг начат");
    console.log(`url: ${this.url}, регион: ${this.region}`);

    for (
      let attemptsCount = 1;
      attemptsCount <= this.constructor.MAX_ATTEMPTS_COUNT;
      attemptsCount++
    ) {
      try {
        console.log(`Попытка ${attemptsCount}`);

        await this.page.goto(this.url, { timeout: 60000 });

        await this.setCurrentRegion();

        const data = {};

        const ratingElem = await this.page.$(".Rating_value__S2QNR");
        data.rating = await this.getText(ratingElem);

        data.cost = await this.getCost("div.PriceInfo_root__GX9Xp > span");
        data.oldCost = await this.getCost(
          "div.PriceInfo_oldPrice__IW3mC > span"
        );

        const reviewCountElem = await this.page.$(".ActionsRow_button__g8vnK");
        data.reviewCount = parseInt(await this.getText(reviewCountElem));

        await this.saveDataAndScreenshot(data);
        break;
      } catch (err) {
        if (attemptsCount === this.MAX_ATTEMPTS_COUNT) {
          throw err;
        }
      }
    }

    console.log("Парсинг завершён");
  }
}
