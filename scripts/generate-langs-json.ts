import fs from "fs";
import jsYaml from "js-yaml";

const LANGS_FILEPATH = "./src/common/languageColors.json";

//Retrieve languages from github linguist repository yaml file
fetch(
  "https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml",
)
  .then((response) => response.text())
  .then((text) => {
    //and convert them to a JS Object
    const languages = jsYaml.load(text) as Record<string, any>;

    const languageColors: Record<string, string> = {};

    //Filter only language colors from the whole file
    Object.keys(languages).forEach((lang) => {
      languageColors[lang] = languages[lang].color;
    });

    //Debug Print
    //console.dir(languageColors);
    fs.writeFileSync(
      LANGS_FILEPATH,
      JSON.stringify(languageColors, null, "    "),
    );
  });
