const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const artDir = 'Art'; // Adjusted to be relative to the root of the repository

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const studentDirs = fs
    .readdirSync(artDir)
    .filter((dir) => fs.lstatSync(path.join(artDir, dir)).isDirectory());

  for (const dir of studentDirs) {
    const projectPath = path.join(process.cwd(), artDir, dir, 'index.html');
    const screenshotPath = path.join(process.cwd(), artDir, dir, 'icon.png');
    const tempPath = path.join(process.cwd(), artDir, dir, 'temp.png');

    if (fs.existsSync(projectPath)) {
      try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        await page.goto(`file://${projectPath}`, { waitUntil: 'networkidle2' });

        // Optional: Wait for specific elements
        await page.waitForSelector('body');

        // Take a high-resolution screenshot
        await page.screenshot({ path: tempPath, fullPage: true, type: 'png' });

        // Verify the temporary screenshot file
        const stats = fs.statSync(tempPath);

        // Process and compress the image using sharp
        await sharp(tempPath)
          .resize({ width: 500 }) // Resize to 500px width
          .toFormat('png', { quality: 80 }) // Adjust quality for PNG
          .toFile(screenshotPath);
      } catch (err) {
        console.error(
          `Failed to generate or process screenshot for ${dir}:`,
          err
        );
      } finally {
        // Optionally remove the temporary high-resolution file
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    } else {
      console.info(`index.html not found for ${dir}`);
    }
  }

  await browser.close();
})();
