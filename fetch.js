const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const fs = require('fs/promises');

const fetchOnion = async (url, outputDir) => {
  try {
    console.log(`Fetching content from: ${url}`);
    const filename = url.replace('http://','').replace('/','');

    const htmlFile = `${outputDir}/${filename}.html`;
    await new Promise((resolve, reject) => {
      console.log('Step 1: Fetch HTML using curl');
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

    console.log('Step 2: Capture screenshot using Puppeteer');
    const browser = await puppeteer.launch({
      args: ['--proxy-server=socks5://127.0.0.1:9050', '--no-sandbox'],
      executablePath: '/usr/bin/chromium-browser',
      headless: 'new',  // Opting into the new headless mode
    });
    const page = await browser.newPage();

    const screenshotFile = `${outputDir}/${filename}.png`;

    // Navigate and wait for full page load
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });  // Wait for full load
    await page.waitForSelector('body');  // Wait until the body tag is available

    // Capture the full page (even if it has multiple pages)
    await page.screenshot({
      path: screenshotFile,
      fullPage: true  // This captures the entire page, including parts outside the visible area
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
