const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { JSDOM } = require("jsdom");

const INPUT_DIR = path.resolve("./raw-docs"); // 原始 html
const OUTPUT_DIR = path.resolve("./final-docs"); // 处理后 html
const IMAGE_ROOT = path.join(OUTPUT_DIR, "images");

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(IMAGE_ROOT)) fs.mkdirSync(IMAGE_ROOT, { recursive: true });

const htmlFiles = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith(".html"));

function hash(str) {
    return crypto.createHash("md5").update(str).digest("hex").slice(0, 8);
}

async function downloadImage(url, filePath) {
    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 Chrome/120",
            Referer: url,
        },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
}

(async () => {
    for (const file of htmlFiles) {
        console.log(`🖼️ 处理：${file}`);

        const inputPath = path.join(INPUT_DIR, file);
        const outputPath = path.join(OUTPUT_DIR, file);

        const html = fs.readFileSync(inputPath, "utf-8");
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const imgs = Array.from(document.querySelectorAll("img"));

        const imgDir = path.join(IMAGE_ROOT, file.replace(".html", ""));
        if (imgs.length > 0) {
            if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
        }

        for (const img of imgs) {
            const src = img.getAttribute("src");
            if (!src) continue;

            // 1️⃣ base64 直接跳过
            if (src.startsWith("data:image")) continue;

            // 2️⃣ 已是本地路径，跳过
            if (!src.startsWith("http")) continue;

            try {
                const url = new URL(src);
                const ext = path.extname(url.pathname) || ".png";
                const filename = `${hash(src)}${ext}`;
                const savePath = path.join(imgDir, filename);

                if (!fs.existsSync(savePath)) {
                    await downloadImage(src, savePath);
                    console.log(`  ⬇️ ${src}`);
                }

                // 计算 html → 图片 的相对路径
                const relativePath = path
                    .relative(path.dirname(outputPath), savePath)
                    .replace(/\\/g, "/");

                img.setAttribute("src", relativePath);
            } catch (err) {
                console.warn(`  ⚠️ 失败：${src}`);
                img.remove(); // 失败就移除，防止离线报错
            }
        }

        fs.writeFileSync(outputPath, dom.serialize(), "utf-8");
    }

    console.log("🎉 所有 HTML 图片已本地化完成");
})();
