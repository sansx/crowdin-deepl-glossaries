import { join } from "path";

import * as fs from "fs";
import axios from "axios";

import crowdin, { GlossariesModel } from "@crowdin/crowdin-api-client";

import * as deepl from "deepl-node";

const csv = require("csv-parser");

axios.interceptors.response.use(
  (res) => {
    return Promise.resolve(res.data);
  },
  (error) => {
    return Promise.reject(error);
  }
);

const { uploadStorageApi, glossariesApi } = new crowdin(
  {
    token: process.env.CROWDIN_API as string,
    // organization: "org",
  },
  { httpClient: axios }
);

export async function uploadCrowdinGlossary(
  languageId: string,
  name: string,
  fileName: string,
  fileContent: any,
  scheme: GlossariesModel.GlossaryFileScheme
): Promise<void> {
  const glossary = await glossariesApi.addGlossary({ languageId, name });
  console.log("glossary", glossary);

  const storage = await uploadStorageApi.addStorage(fileName, fileContent);

  console.log("storage", storage);

  const importGlossary = await glossariesApi.importGlossaryFile(
    glossary.data.id,
    {
      storageId: storage.data.id,
      scheme,
    }
  );

  let status = importGlossary.data.status;
  while (status !== "finished") {
    const progress = await glossariesApi.checkGlossaryImportStatus(
      glossary.data.id,
      importGlossary.data.identifier
    );
    status = progress.data.status;
  }
}

export async function uploadDeeplGlossary(
  glossaryName: string,
  sourceLang: deepl.LanguageCode,
  targetLang: deepl.LanguageCode,
  entries: any
) {
  const translator = new deepl.Translator(process.env.DEEPL_KEY as string);

  console.log("process.env.DEEPL_KEY", process.env.DEEPL_KEY);

  const targetEntries = new deepl.GlossaryEntries({
    entries,
  });
  const glossaryEnToDe = await translator.createGlossary(
    glossaryName,
    sourceLang,
    targetLang,
    targetEntries
  );
  let glossaries = await translator.listGlossaries();
  console.log("glossaries", glossaries);
  const glossary: any = glossaries.find(
    (glossary) => glossary.name == glossaryName
  );
  console.log(
    `Glossary ID: ${glossary?.glossaryId}, source: ${glossary?.sourceLang}, ` +
      `target: ${glossary?.targetLang}, contains ${glossary?.entryCount} entries.`
  );
}

export const getGlossaryEntires = (filePath: string) => {
  const results: any = [];
  return new Promise((res) => {
    fs.createReadStream(filePath)
      .pipe(
        csv({
          mapHeaders: ({ header, index }: any) =>
            header.includes("Term:English") ? "Term:English" : header,
        })
      )
      .on("data", (data: any) => results.push(data))
      .on("end", () => {
        const entriesObj: any = {};
        results.forEach((res: any) => {
          entriesObj[res["Term:English"]] = res["Term:English"];
        });
        res(entriesObj);
      });
  });
};
