import puppeteer from 'puppeteer';

const url = "https://www.joshwcomeau.com/";

const main = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    
}

main();