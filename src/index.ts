import { clientOpts, glossaryIds, testingOpts } from "./configs/glossaryOpts";
import {
  uploadCrowdinGlossary,
  uploadDeeplGlossary,
  getGlossaryEntires,
} from "./uploadGlossary";
import { logHandler } from "./utils/logHandler";
import { validateEnv } from "./utils/validateEnv";

import { join } from "path";

import * as fs from "fs";

(async () => {
  validateEnv();
  var readDir = fs
    .readdirSync(process.cwd() + "/glossaries")
    .filter((fileName) => fileName.includes(".csv"));
  console.log(readDir);
  const file = "ton.csv";
  const fileName = join(process.cwd() + `/glossaries/${file}`);
  const fileContent = fs.readFileSync(fileName, "utf-8");

  const readRes = await getGlossaryEntires(fileName);
  console.log("readRes", readRes);

  console.log(
    "asd",
    process.env.DEEPL_KEY,
    process.env.CROWDIN_API,
    process.env
  );

  // uploadDeeplGlossary("My test glossary", "en", "zh", readRes);

  // console.log("fileContent", fileContent);

  // const schema = {
  //   term_en: 0,
  //   description_en: 1,
  // };

  // uploadCrowdinGlossary("en", "testing", file, fileContent, schema);
})();
