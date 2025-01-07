const puppeteer = require("puppeteer");
const { exec } = require("child_process");
const fs = require("fs/promises");

const fetchOnion = async (url, outputDir, _group) => {
  try {
    console.log(`Fetching content from: ${url}`);
    const group = _group.replaceAll("/", "").replaceAll(" ", "").toLowerCase();
    const filename =
      group +
      "-" +
      url.replace("http://", "").replace("https://", "").replaceAll("/", "");

    const htmlFile = `${outputDir}/${filename}.html`;
    await new Promise((resolve, reject) => {
      console.log("Step 1: Fetch HTML using curl");
      // ignore SSL errors, self signed certs!
      const curlCommand = `curl -L --insecure --socks5-hostname 127.0.0.1:9050 ${url} -o ${htmlFile}`;
      exec(curlCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`curl error: ${stderr}`);
          reject(error);
        } else {
          console.log(`HTML content saved to ${htmlFile}`);
          resolve(stdout);
        }
      });
    });

    console.log("Step 2: Capture screenshot using Puppeteer");
    const browser = await puppeteer.launch({
      args: [
        "--proxy-server=socks5://127.0.0.1:9050",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-accelerated-2d-canvas",
        "--ignore-certificate-errors",
        //        "--disable-dev-shm-usage",
        //        "--single-process",
      ],
      executablePath: "/usr/bin/chromium-browser",
      headless: "new",
      timeout: 300000,
      protocolTimeout: 300000,
    });
    console.log("Step 3: wait for new page");
    const page = await browser.newPage();

    await page.setViewport({
      width: 1024,
/*      height: 800,
      deviceScaleFactor: 1,
      isMobile: false*/
    });

    await page.setExtraHTTPHeaders({
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
    });

    console.log("Step 4: Navigate and wait for full page load");
    await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 }); // Wait for full load
    await page.waitForSelector("body"); // Wait until the body tag is available

    console.log(
      "Step 5: Capture the full page (even if it has multiple pages)",
    );
    const screenshotFile = `${outputDir}/${filename}.png`;
    await page.screenshot({
      path: screenshotFile,
      fullPage: true,
    });
    console.log(`Screenshot saved to ${screenshotFile}`);

    await browser.close();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
  }
};

// Entry point for the script
(async () => {
  const args = process.argv.slice(2);
  const url = args[0];
  const outputDir = args[1] || "./output";
  const group = args[2] || "Unknown";

  if (!url) {
    console.error("Usage: node fetch.js <URL> [OUTPUT_DIR]");
    process.exit(1);
  }

  console.log("Analyse", group);

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Fetch the onion content
  await fetchOnion(url, outputDir, group);
})();
