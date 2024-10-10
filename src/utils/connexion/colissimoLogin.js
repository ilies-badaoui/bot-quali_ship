const puppeteer = require('puppeteer');
const { delay } = require('../utils'); // Si tu as un utilitaire pour le délai

async function colissimoLogin() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    //userDataDir: "./tmp" // Utilisation d'un profil temporaire
  });
  const page = await browser.newPage();

  try {
    // Lancer la page 
    await page.goto('https://www.colissimo.entreprise.laposte.fr/', { waitUntil: 'networkidle2' });

    // Étape 1 : Cliquer sur "Tout accepter" (cookies)
    await page.waitForSelector('.agree-button.eu-cookie-compliance-default-button', { visible: true, timeout: 60000 });
    await page.click('.agree-button.eu-cookie-compliance-default-button');  // Cliquer sur "Tout accepter"

    await delay(1000);
    // Étape 2 : Cliquer sur "Passer"
    await page.waitForSelector('.button.button--primary.shepherd-button', { visible: true, timeout: 60000 });
    await page.click('.button.button--primary.shepherd-button');  // Cliquer sur "Passer"

    // Étape 3 : Se connecter
    await page.waitForSelector('.ci-compte', { visible: true, timeout: 60000 });
    await page.click('.ci-compte');  // Cliquer sur le bouton "Se connecter"

    // Étape 4 : Entrer les identifiants
    await page.waitForSelector('#edit-login', { visible: true, timeout: 60000 });

    // Faire défiler jusqu'à l'élément si nécessaire
    await page.evaluate(() => {
      document.querySelector('#edit-login').scrollIntoView();
    });

    await page.click('#edit-login');  // Donner le focus au champ identifiant
    await page.type('#edit-login', 'FRENCHLOG', { delay: 100 });  // Entrer l'identifiant avec délai

    // Délai manuel de 500ms
    await delay(500);

    await page.waitForSelector('#edit-pass', { visible: true, timeout: 60000 });

    // Faire défiler jusqu'au champ mot de passe si nécessaire
    await page.evaluate(() => {
      document.querySelector('#edit-pass').scrollIntoView();
    });

    await page.click('#edit-pass');  // Donner le focus au champ mot de passe
    await page.type('#edit-pass', 'FrenchloG11!', { delay: 100 });  // Entrer le mot de passe

    // Étape 5 : Cliquer sur "Confirmer"
    await page.waitForSelector('#edit-connect', { visible: true, timeout: 60000 });

    // Faire défiler jusqu'au bouton de connexion et forcer le clic
    await page.evaluate(() => {
      document.querySelector('#edit-connect').scrollIntoView();
    });

    await page.click('#edit-connect');

    // Vérifier si la connexion a réussi
    await page.waitForSelector('a[href="/mon-compte"]', { timeout: 60000 });

    const loggedIn = await page.$('a[href="/mon-compte"]');
    if (loggedIn) {
      console.log('Connexion réussie !');
    return { browser, page };
    }
  } catch (error) {
    console.error('Erreur lors de la tentative de connexion :', error);
    await browser.close();
    throw error;
  }
}

module.exports = colissimoLogin;
