// build.js
import fs from "fs";

const rss = fs.readFileSync("feed.xml", "utf-8");

// 超簡易RSSパーサ（item単位）
const items = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => {
  const get = (tag) => {
    const r = m[1].match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
    return r ? r[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
  };

  return {
    title: get("title"),
    link: get("link"),
    date: new Date(get("pubDate")).toISOString(),
    domain: (() => {
      try { return new URL(get("link")).hostname; }
      catch { return ""; }
    })()
  };
});

const buildTime = new Date()
  .toISOString()
  .replace("T", " ")
  .slice(0, 19); // YYYY-MM-DD HH:mm:ss

// テンプレートに埋め込み
const template = fs.readFileSync("template.html", "utf-8");
const html = template.replace(
  "__ITEMS_JSON__",
  JSON.stringify(items, null, 2)
);

html = html.replace("__BUILD_TIME__", buildTime);

fs.writeFileSync("index.html", html);
console.log("index.html generated");
