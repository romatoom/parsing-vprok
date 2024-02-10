import fs from "fs/promises";
import AdmZip from "adm-zip";

const regionFolderNames = await fs.readdir(`results`, { withFileTypes: false });

async function compress(folder) {
  const zip = new AdmZip();
  const outputFile = `compressed_results/${folder}.zip`;
  zip.addLocalFolder(`results/${folder}`);
  zip.writeZip(outputFile);
  console.log(`Created ${outputFile} successfully`);
}

await fs.mkdir("compressed_results", { recursive: true });

for (const folder of regionFolderNames) {
  compress(folder);
}
