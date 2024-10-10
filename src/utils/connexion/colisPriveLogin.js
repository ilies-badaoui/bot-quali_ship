const puppeteer = require('puppeteer');
const { delay } = require('../utils');  // Si tu utilises un utilitaire de délai

async function colisPriveLogin() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
  });
  const page = await browser.newPage();

  try {
    // Lancer la page
    await page.goto('https://www.colisprive.com/agence/Account/Login.aspx?ReturnUrl=%2fAgence%2f', { waitUntil: 'networkidle2' });

    // Attendre que la page soit complètement chargée
    await delay(3000);

    // Attendre que le champ de connexion soit visible
    await page.waitForSelector('#LM_RM_RS_Ct_MCt_tbUserName_I');
    await page.type('#LM_RM_RS_Ct_MCt_tbUserName_I', 'BOOST');
    await delay(3000);

    // Entrer le mot de passe
    await page.waitForSelector('#LM_RM_RS_Ct_MCt_tbPassword_I');
    await page.type('#LM_RM_RS_Ct_MCt_tbPassword_I', 'Boost123!!');
    await delay(1000);

    // Debugging : vérifier le sélecteur
    const loginButton = await page.$('#LM_RM_RS_Ct_MCt_btnLogin_CD > span');
    if (loginButton) {
      await page.click('#LM_RM_RS_Ct_MCt_btnLogin_CD > span');  // Cliquer sur le bouton de connexion
    } else {
      console.error("Le bouton de connexion n'a pas été trouvé !");
      await page.screenshot({ path: 'login-button-not-found.png' });  // Capture pour debug
      throw new Error('Le sélecteur #LM_RM_RS_Ct_MCt_btnLogin_CD > span est introuvable.');
    }

    // Attendre la navigation après la connexion
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log('Connexion réussie !');

    return { browser, page };  // Retourne le navigateur et la page
  } catch (error) {
    console.error('Erreur lors de la tentative de connexion :', error);
    await browser.close();
    throw error;
  }
}

module.exports = colisPriveLogin;