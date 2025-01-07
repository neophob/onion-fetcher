const puppeteer = require("puppeteer");
const { exec } = require("child_process");
const fs = require("fs/promises");

const fetchOnion = async (url, outputDir) => {
  try {
    console.log(`Fetching content from: ${url}`);
    const filename = url.replace("http://", "").replace("/", "");

    const htmlFile = `${outputDir}/${filename}.html`;
    await new Promise((resolve, reject) => {
      console.log("Step 1: Fetch HTML using curl");
      const curlCommand = `curl --socks5-hostname 127.0.0.1:9050 ${url} -o ${htmlFile}`;
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
        "--disable-dev-shm-usage",
        "--single-process",
      ],
      executablePath: "/usr/bin/chromium-browser",
      headless: "new",
      timeout: 160000,
      protocolTimeout: 160000,
    });
    console.log("Step 3: wait for new page");
    const page = await browser.newPage();

    console.log("Step 4: Navigate and wait for full page load");
    await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 }); // Wait for full load
    await page.waitForSelector("body"); // Wait until the body tag is available

    console.log(
      "Step 5: Capture the full page (even if it has multiple pages)",
    );
    await page.screenshot({
      path: screenshotFile,
      fullPage: true,
    });
    const screenshotFile = `${outputDir}/${filename}.png`;
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

  if (!url) {
    console.error("Usage: node fetch.js <URL> [OUTPUT_DIR]");
    process.exit(1);
  }

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Fetch the onion content
  await fetchOnion(url, outputDir);
})();
