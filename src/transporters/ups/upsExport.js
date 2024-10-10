const puppeteer = require('puppeteer');
const { delay } = require('../../utils/utils');
const upsLogin = require('../../utils/connexion/upsLogin');

async function upsExport(_params) {
  try {
    const { browser, page } = await upsLogin();
    await delay(2000);

    await page.waitForSelector('#MM_RM_RS_Ct_CtS_nbMenuGauche_GHC0', { visible: true, timeout: 60000 });
    await page.click('#MM_RM_RS_Ct_CtS_nbMenuGauche_GHC0');
    await delay(1000);

    await page.waitForSelector('#MM_RM_RS_Ct_CtS_nbMenuGauche_I0i0_T > span', { visible: true, timeout: 60000 });
    await page.click('#MM_RM_RS_Ct_CtS_nbMenuGauche_I0i0_T > span');
    await delay(60000);

    // Fermer le navigateur
    await browser.close();
  } catch (error) {
    console.error('Échec de la connexion Colis Privé:', error);
  }
}

module.exports = upsExport;