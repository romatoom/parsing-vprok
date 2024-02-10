import fs from "fs/promises";

function getTextForPage(page) {
  return async (elem) => {
    return page.evaluate((el) => el.innerText, elem);
  };
}

const getSavingPath = async (url, region) => {
  const dirPath = `results/${region}/${url.split("/").pop()}`;
  await fs.mkdir(dirPath, { recursive: true });

  return dirPath;
};

export { getTextForPage, getSavingPath };
