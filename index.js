const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

// 临时文件，记录抓取的 URL，以及中断时的进度
const TEMP_FILE = "./crawl.temp.json";
function initTempJSON() {
    fs.writeFileSync(
        TEMP_FILE,
        JSON.stringify({
            urls: [],
            failPageIndex: 0,
        }),
        "utf-8"
    );
}
if (!fs.existsSync(TEMP_FILE)) {
    initTempJSON();
}

// 保存临时数据
function saveTemp(key, data) {
    const temp = JSON.parse(fs.readFileSync(TEMP_FILE, "utf-8"));
    temp[key] = data;
    fs.writeFileSync(TEMP_FILE, JSON.stringify(temp), "utf-8");
}

const OUTPUT_DIR = path.resolve("./raw-docs"); // 输出目录，还需要进行后续处理
const START_URL = "https://developer.work.weixin.qq.com/document/path/90664"; // 企业微信文档首页

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 企微文档每一页URL末尾是五位或者六位的数字组成
function safeFileName(url) {
    const arr = url.split("/"); // 分割 URL
    return arr[arr.length - 1]; // 取最后一项
}

(async () => {
    // 使用系统自带chrome浏览器
    const browser = await chromium.launch({
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        headless: true,
    });

    const page = await browser.newPage({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
    });

    console.log("🚀 打开文档首页...");
    await page.goto(START_URL, { waitUntil: "networkidle" });

    /**
     * 1️⃣ 获取左侧目录里的所有文档链接
     * 注意：企业微信文档左侧是 a 标签路由
     */
    const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll(".ep-layout-sidebar a"));
        return anchors
            .map(a => a.href)
            .filter(href => href.includes("/document/path/") && !href.includes("#"));
    });

    // 读取临时文件
    const temp = JSON.parse(fs.readFileSync(TEMP_FILE, "utf-8"));

    const uniqueLinks = Array.from(new Set(links));
    saveTemp("urls", uniqueLinks);
    console.log(`📄 共发现 ${uniqueLinks.length} 个文档页面`);

    /**
     * 2️⃣ 逐个页面打开并保存 HTML
     */
    for (let i = 0; i < uniqueLinks.length; i++) {
        if (temp.failPageIndex && i < temp.failPageIndex) {
            continue;
        }

        const url = uniqueLinks[i];
        console.log(`📥 [${i + 1}/${uniqueLinks.length}] 抓取：${url}`);

        try {
            await page.goto(url, { waitUntil: "networkidle" });

            // #js-ep-doc-cnt 是正文
            await page.waitForSelector("#js-ep-doc-cnt", { timeout: 10000 });

            // 在浏览器上下文中执行
            const html = await page.evaluate(() => {
                const content = document.querySelector("#js-ep-doc-cnt");
                if (!content) return "";

                // 构造一个最小可用 HTML
                return `
                <!DOCTYPE html>
                <html lang="zh-CN">
                <head>
                <meta charset="UTF-8" />
                <title>${document.title}</title>
                <link rel="stylesheet" href="../doc-style.css" />
                </head>
                <body>
                ${content.outerHTML}
                <script src="../doc-script.js"></script>
                </body>
                </html>
                `;
            });

            if (!html) {
                console.error(`❌ 抓取失败：${url}`);
                saveTemp("failPageIndex", i);
                break;
            }

            const fileName = safeFileName(url) + ".html";
            console.log(`✅ 保存：${fileName}`);
            const filePath = path.join(OUTPUT_DIR, fileName);

            fs.writeFileSync(filePath, html, "utf-8");

            const stayTime = Math.floor(Math.random() * 1000) + 500; // 500ms - 1500ms
            await page.waitForTimeout(stayTime); // 每页停 0.5s

            if (i === uniqueLinks.length - 1) {
                initTempJSON(); // 重置临时文件
                console.log("✅ 所有文档抓取完成");
            }
        } catch (err) {
            console.error(`❌ 抓取失败：${url}`, err.message);
            saveTemp("failPageIndex", i);
            break;
        }
    }
    await browser.close();
})();
