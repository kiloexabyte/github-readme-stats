import "dotenv/config";
import statsCard from "./api/index.js";
import repoCard from "./api/pin.js";
import langCard from "./api/top-langs.js";
import wakatimeCard from "./api/wakatime.js";
import gistCard from "./api/gist.js";
import express from "express";

const app = express();
app.listen(process.env.port || 9000);

app.get("/", statsCard as any);
app.get("/pin", repoCard as any);
app.get("/top-langs", langCard as any);
app.get("/wakatime", wakatimeCard as any);
app.get("/gist", gistCard as any);
