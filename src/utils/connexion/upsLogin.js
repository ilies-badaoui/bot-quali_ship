const puppeteer = require('puppeteer');
const { delay } = require('../utils');  // Si tu utilises un utilitaire de délai

async function upsLogin() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 800 },
    });
    const page = await browser.newPage();

    try {
        // Lancer la page
        await page.goto('https://www.ups.com/fr/fr/support/file-a-claim.page', { waitUntil: 'networkidle2' });

        // Attendre que la page soit complètement chargée
        await delay(1000);

        // cliquer sur le popup
        await page.waitForSelector('#__tealiumGDPRecModal > div.privacy_prompt_middle > div > div.privacy_prompt_content > div.option_set > div:nth-child(1) > label > span');
        await page.click('#__tealiumGDPRecModal > div.privacy_prompt_middle > div > div.privacy_prompt_content > div.option_set > div:nth-child(1) > label > span');
        await delay(1000);

        // validé le popup
        await page.waitForSelector('#consent_prompt_submit');
        await page.click('#consent_prompt_submit');
        await delay(1000);

        // appuyer sur se connecter
        await page.waitForSelector('#ups-navContainer > header > div.ups-container.navbar-expand-lg > div.ups-user-actions.dropdown > a.ups-cta.ups-cta-primary.d-none.d-md-block.ups-analytics');
        await page.click('#ups-navContainer > header > div.ups-container.navbar-expand-lg > div.ups-user-actions.dropdown > a.ups-cta.ups-cta-primary.d-none.d-md-block.ups-analytics');
        await delay(1000);

        // Attendre que le champ de connexion soit visible
        await page.waitForSelector('#email');
        await page.type('#email', 'boostecomm');
        await delay(2000);

        // appuyer sur suivant 
        await page.waitForSelector('#submitBtn');
        await page.click('#submitBtn');
        await delay(1000);

        // Entrer le mot de passe
        await page.waitForSelector('#password');
        await page.type('#password', 'Boostsetp2024@?');
        await delay(1000);

        // Debugging : vérifier le sélecteur
        const loginButton = await page.$('');
        if (loginButton) {
            await page.click('');  // Cliquer sur le bouton de connexion
        } else {
            console.error("Le bouton de connexion n'a pas été trouvé !");
            await page.screenshot({ path: 'login-button-not-found.png' });  // Capture pour debug
            throw new Error('Le sélecteur est introuvable.');
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

module.exports = upsLogin;