const puppeteer = require('puppeteer');
const { delay } = require('../utils');  // Si tu utilises un utilitaire de délai

async function glsLogin() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
  });
  const page = await browser.newPage();

  try {
    // Lancer la page
    await page.goto('https://gls-group.eu/FR/fr/home/', { waitUntil: 'networkidle2' });

    // Attendre que la page soit complètement chargée
    await delay(3000);  // Temps d'attente pour s'assurer que tous les éléments sont visibles

    // Gérer le popup de cookies
    await page.waitForSelector('#s-c-bn', { visible: true, timeout: 60000 });
    await page.click('#s-c-bn');  // Cliquer sur "Tout accepter"
    await delay(3000);

    // Attendre et appuyer sur se connecter
    await page.waitForSelector('#contentwrapper > header > div.ce_header_desktop.fixed-top > div > div > div > ul > li:nth-child(5) > a > span');
    await page.click('#contentwrapper > header > div.ce_header_desktop.fixed-top > div > div > div > ul > li:nth-child(5) > a > span');
    await delay(3000);

    // Attendre que le champ de connexion soit visible
    await page.waitForSelector('#wilh001_login_username_input');
    await page.type('#wilh001_login_username_input', '2504566601');
    await delay(3000);

    // Entrer le mot de passe
    await page.waitForSelector('#wilh001_login_password_input');
    await page.type('#wilh001_login_password_input', 'FrenchloG2023?');
    await delay(1000);

    // Debugging : vérifier le sélecteur
    const loginButton = await page.$('#wilh001_login_submit');
    if (loginButton) {
      await page.click('#wilh001_login_submit');  // Cliquer sur le bouton de connexion
    } else {
      console.error("Le bouton de connexion n'a pas été trouvé !");
      await page.screenshot({ path: 'login-button-not-found.png' });  // Capture pour debug
      throw new Error('Le sélecteur #wilh001_login_submit est introuvable.');
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

module.exports = glsLogin;
