import fs from "fs/promises";

export default class DataSaver {
  constructor(dirPath, data) {
    this.data = data;
    this.dirPath = dirPath;
  }

  async save() {
    const dataStr = Object.entries(this.data).reduce((acc, curr) => {
      const [attrName, value] = curr;
      return value ? `${acc}${attrName}=${value}\n` : acc;
    }, "");

    await fs.writeFile(`${this.dirPath}/product.txt`, dataStr);
  }
}
