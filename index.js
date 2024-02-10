import Parser from "./src/parser.js";

// Используем для предотвращения запуска парсинга для недоступных регионов
const availableRegions = [
  "Москва и область",
  "Санкт-Петербург и область",
  "Владимирская обл.",
  "Калужская обл.",
  "Рязанская обл.",
  "Тверская обл.",
  "Тульская обл.",
];

if (process.argv.length !== 4) {
  console.error("Неверное число аргументов. Укажите url и регион");
  process.exit();
}

const [url, region] = process.argv.slice(2);

if (!availableRegions.includes(region)) {
  console.error("Указан недоступный регион");
  process.exit();
}

const parser = await Parser.init(url, region);

try {
  await parser.start();
} catch (err) {
  console.error(`Ошибка при попытке парсинга\n${err}`);
}

await parser.destroy();
