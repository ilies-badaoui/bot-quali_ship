const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { uploadToSftp } = require('../../sftp/sftpClientColissimo');

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}

async function loginColissimoImport() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    //userDataDir: "./tmp" // Utilisation d'un profil temporaire
  });
  const page = await browser.newPage();

  try {
    // Dossier temporaire pour le téléchargement
    const tempDownloadPath = path.resolve(__dirname, "temp_download");
    // Créer le dossier temporaire s'il n'existe pas
    if (!fs.existsSync(tempDownloadPath)) {
      fs.mkdirSync(tempDownloadPath);
    }

    // Configurer Puppeteer pour télécharger les fichiers dans le dossier temporaire
    await page._client().send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: tempDownloadPath,
    });

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

      // Étape 10 : Cliquer sur "Service clients"
      await page.waitForSelector('#header-lin-service-clients', { visible: true, timeout: 60000 });
      await page.click('#header-lin-service-clients');
      await delay(1000);

      // Étape 11 : Cliquer sur "Rechercher une demande"
      await page.evaluate(() => {
        const button = document.querySelector("#service-lin-Rechercher\\ une\\ demande > mat-card-header > div.mat-card-header-text > mat-card-title");
        if (button) {
          button.click();
        } else {
          throw new Error('Bouton "Rechercher" non trouvé');
        }
      });
      console.log('Page de suivi des réclamations en masse chargée avec succès.');
      await delay(1000);

      // Étape 12 : Cliquer sur la croix 
      await page.evaluate(() => {
        const button = document.querySelector("#cdk-accordion-child-5 > div > form > div.search-row > div.criteria-list > div:nth-child(3) > app-dynamic-input > div > div.criterion-selector.ng-star-inserted > button > span.mat-button-wrapper > mat-icon");
        if (button) {
          button.click();
        } else {
          throw new Error('Bouton non trouvé');
        }
      });
      await delay(1000);
      // étape 13 : cliquer sur expediteur 
      await page.waitForSelector('#mat-select-value-9', { visible: true, timeout: 60000 });
      await page.click('#mat-select-value-9'), (element) => element.click()

      // Étape 14 : Clique sur tout selectionné
      await page.waitForSelector('#recherche-chp-critere-role-createur-selectioner-tout > label > span.mat-checkbox-inner-container', { visible: true, timeout: 60000 });
      await page.click('#recherche-chp-critere-role-createur-selectioner-tout > label > span.mat-checkbox-inner-container'), (element) => element.click();


      await delay(1000);
      // Étape 15 : Cliquer sur rechercher
      await page.evaluate(() => {
        const button = document.querySelector("#recherche-btn-rechercher > span.mat-button-wrapper");
        if (button) {
          button.click();
        } else {
          throw new Error('Bouton "Rechercher" non trouvé');
        }
      });

      console.log('Recherche lancée !');

      // Étape 16 : Cliquer sur "Exporter tous les résultats "
      await page.waitForSelector('#resultat-btn-exporter > span.mat-button-wrapper > mat-icon', { visible: true, timeout: 60000 });
      await page.$eval('#resultat-btn-exporter > span.mat-button-wrapper > mat-icon', (element) => element.click());

      // Étape 17 : Valider "Exporter tous les résultats "
      await page.evaluate(() => {
        const button = document.querySelector("#resultat-btn-exporter-tous");
        if (button) {
          button.click();
        } else {
          throw new Error('Bouton non trouvé');
        }
      });

      // Étape 18 : Valider "Exporter tous les colonnes"
      await page.evaluate(() => {
        const button = document.querySelector("#resultat-btn-exporter-tous");
        if (button) {
          button.click();
        } else {
          throw new Error('Bouton non trouvé');
        }
      });

      // Étape 19 : lancer le telechargement
      await page.evaluate(() => {
        const button = document.querySelector("#mat-dialog-0 > app-dialog > div.footer > button > span.mat-button-wrapper");
        if (button) {
          button.click();
        } else {
          throw new Error('Bouton non trouvé');
        }
      });

      console.log('Téléchargement terminé');

      // Vérifier si le fichier a été téléchargé correctement
      await delay(10000); // Attendre 10 secondes pour laisser le temps au fichier de se télécharger
      
      // Chercher le fichier téléchargé dans le dossier temporaire
      const downloadedFiles = fs.readdirSync(tempDownloadPath);
      const exportFile = downloadedFiles.find(
        (file) => file.startsWith("EXPORT") && file.endsWith(".csv")
      );

      if (exportFile) {
        console.log(`Fichier téléchargé : ${exportFile}`);

        // Chemin du fichier téléchargé
      const tempFilePath = path.join(tempDownloadPath, exportFile);
      // Chemin final dans le dossier retourReclamation
      const finalDownloadPath = path.join(
        "C:/Users/badao/Desktop/bot-quali-ship/src/retourReclamation",
        exportFile
      );
      // Déplacer le fichier dans le dossier final
      fs.renameSync(tempFilePath, finalDownloadPath);
      console.log(`Fichier déplacé vers : ${finalDownloadPath}`);

      try {
        await uploadToSftp(finalDownloadPath);
        console.log('Fichier transféré sur le serveur SFTP avec succès !');

        // Supprimer le fichier local après le transfert
        fs.unlinkSync(finalDownloadPath);
        console.log(`Fichier supprimé : ${finalDownloadPath}`);
      } catch (error) {
        console.error('Erreur lors du transfert du fichier SFTP:', error);
      }
    } else {
      console.log('Aucun fichier CSV trouvé dans le répertoire.');
    }

      // Attendre 3 secondes
      await delay(3000).then(() => {
        // Fermer le navigateur
        browser.close();
      });
    } else {
      console.log('Connexion échouée.');
    }

  } catch (error) {
    console.error('Erreur lors de la tentative de connexion:', error);
  }
}

// Lancer le bot
module.exports = loginColissimoImport;