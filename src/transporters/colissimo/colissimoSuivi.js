const puppeteer = require('puppeteer');
const { getInProgressClaims } = require('../../sftp/sftpClientColissimo');
const fs = require('fs');
const path = require('path');

function delay(time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time)
    });
  }

  async function loginAndNavigateToClaims(page) {
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

        await delay(3000);
      // Étape 6 : Cliquer sur "Passer"
      await page.waitForSelector('.button.button--primary.shepherd-button', { visible: true, timeout: 60000 });
      await page.click('.button.button--primary.shepherd-button');  // Cliquer sur "Passer"

      await page.waitForSelector('button');  // Attendre un bouton générique
      const buttons = await page.$$eval('button', buttons => buttons.map(btn => btn.innerText));  // Récupérer tous les boutons

      // Chercher le bouton avec le texte "Mon compte"
      const index = buttons.indexOf('Mon compte');
      if (index !== -1) {
        const button = (await page.$$('button'))[index];  // Sélectionner le bon bouton
        await button.click();  // Cliquer sur le bouton "Mon compte"
      } else {
        throw new Error('Bouton "Mon compte" non trouvé');
      }

      // Étape 7 : Cliquer sur "Mes services"
      await page.waitForSelector('#block-navigationprincipale > div.menu-to-open > ul > li.menu-item.mon-compte.menu-item--expanded.item-parent > ul > li.menu-item.mes-services > a[href="/mon-compte#services"]');
      await page.click('#block-navigationprincipale > div.menu-to-open > ul > li.menu-item.mon-compte.menu-item--expanded.item-parent > ul > li.menu-item.mes-services > a[href="/mon-compte#services"]');

      await delay(1000);

      // Étape 8 : Cliquer sur "Outils de suivi clés en main pour vous et vos clients"
      await page.waitForSelector('#didactitiel--15 > div.content > div > div.field__item > h5', { visible: true, timeout: 60000 });
      await page.click('#didactitiel--15 > div.content > div > div.field__item > h5');

      // Étape 9 : Cliquer sur "Outil de suivi colis"
      await page.waitForSelector('#didactitiel--15 > div.content_collapse > div.field.field--name-field-application-link.field--type-entity-reference.field--label-visually_hidden > div.field__item > article > div > div > div.field__item > a', { visible: true, timeout: 60000 });
      await page.click('#didactitiel--15 > div.content_collapse > div.field.field--name-field-application-link.field--type-entity-reference.field--label-visually_hidden > div.field__item > article > div > div > div.field__item > a');





    }
    } catch (error) {
        console.error(`Erreur lors de la tentative de connexion pour ${fileName}:`, error);  // Utilisation correcte de fileName
      } finally {
        await browser.close();
      }
    }
    module.exports = loginAndNavigateToClaims;