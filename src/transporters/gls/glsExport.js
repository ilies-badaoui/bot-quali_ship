const puppeteer = require('puppeteer');
const glsLogin = require('../../utils/connexion/glsLogin');
const { delay } = require('../../utils/utils');

async function glsExport(params) {
  try {
    const { browser, page } = await glsLogin();
    console.log('Connexion réussie!');
    await delay(2000);

    await page.waitForSelector('#main-container > ng-include > div > div:nth-child(10) > gls-teaser > div > a > div > img', { visible: true, timeout: 60000 });
    await page.click('#main-container > ng-include > div > div:nth-child(10) > gls-teaser > div > a > div > img');  // Cliquer sur "Tout accepter"
    await delay(30000);

    // Fermer le navigateur
    await browser.close();
  } catch (error) {
    console.error('Échec de la connexion GLS:', error);
  }
}

module.exports = glsExport;
