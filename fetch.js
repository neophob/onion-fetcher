const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const fs = require('fs/promises');

const fetchOnion = async (url, outputDir) => {
  try {
    console.log(`Fetching content from: ${url}`);

    // Step 1: Fetch HTML using curl
    const htmlFile = `${outputDir}/${url}.html`;
    await new Promise((resolve, reject) => {
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

    // Step 2: Capture screenshot using Puppeteer
    const browser = await puppeteer.launch({
      args: ['--proxy-server=socks5://127.0.0.1:9050', '--no-sandbox'],
      executablePath: '/usr/bin/chromium-browser',
      headless: 'new',  // Opting into the new headless mode
    });
    const page = await browser.newPage();
    const screenshotFile = `${outputDir}/${url}.png`;

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.screenshot({ path: screenshotFile });
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
  const outputDir = args[1] || './output';

  if (!url) {
    console.error('Usage: node fetch.js <URL> [OUTPUT_DIR]');
    process.exit(1);
  }

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Fetch the onion content
  await fetchOnion(url, outputDir);
})();
