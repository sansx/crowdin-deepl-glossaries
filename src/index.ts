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
  var readDirFiles = fs
    .readdirSync(process.cwd() + "/glossaries")
    .filter(
      (fileName) => fileName.includes(".csv") && !fileName.includes("test")
    );
  console.log(readDirFiles);

  const totalEntires = await Promise.all(
    readDirFiles.map((fileName) =>
      getGlossaryEntires(join(process.cwd() + `/glossaries/${fileName}`))
    )
  );

  const totalEntiresObj = totalEntires.reduce(
    (a: any, b: any) => ({ ...a, ...b }),
    {}
  );

  uploadDeeplGlossary("My test glossary", "en", "zh", totalEntiresObj);

  readDirFiles.forEach((fileName: string) => {
    const targetFileName = join(process.cwd() + `/glossaries/${fileName}`);
    const fileContent = fs.readFileSync(targetFileName, "utf-8");
    const schema = {
      term_en: 0,
      description_en: 1,
    };
    uploadCrowdinGlossary(
      "en",
      `my ${fileName?.replace(".csv", "")} testing`,
      fileName,
      fileContent,
      schema
    );
  });

  // const file = "ton.csv";
  // const fileName = join(process.cwd() + `/glossaries/${file}`);
  // const fileContent = fs.readFileSync(fileName, "utf-8");

  // const readRes = await getGlossaryEntires(fileName);
  // console.log("readRes", readRes);

  // console.log("fileContent", fileContent);

  // const schema = {
  //   term_en: 0,
  //   description_en: 1,
  // };

  // uploadCrowdinGlossary("en", "testing", file, fileContent, schema);
})();
