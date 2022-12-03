import * as fs from "fs";
import XXH from "xxhashjs";

const importPath = "./articles";
const exportPath = "./src/pages/blog/articles";
const seed = 0x9747b28c;

fs.readdirSync(exportPath).forEach((file) => {
  fs.unlinkSync(`${exportPath}/${file}`);
});

fs.readdir(importPath, (err, files) => {
  if (err) {
    console.error(err);
    return;
  }

  const mdFiles = files.filter((file) => file.endsWith(".md"));

  mdFiles.forEach((file) => {
    fs.readFile(`${importPath}/${file}`, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      const frontMatter = data
        .split("---")[1]
        .trim()
        .split("\n")
        .map((line) => line.split(": "))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

      if (frontMatter.draft === "true") {
        return;
      }

      const payload = JSON.stringify(frontMatter);
      const hash = XXH.h64(seed).update(payload).digest().toString(16);

      console.log(`${file} -> ${hash}.md`);

      fs.writeFile(`${exportPath}/${hash}.md`, data, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    });
  });
});
