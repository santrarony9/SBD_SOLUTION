const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Listen to all console logs
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    // Listen to page errors (unhandled exceptions)
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

    try {
        await page.goto('http://localhost:3000/product/sunp9(r)-1771585962709', { waitUntil: 'networkidle2' });
        console.log("Navigated to page successfully.");
    } catch (e) {
        console.log("Error navigating:", e);
    }

    await browser.close();
})();
