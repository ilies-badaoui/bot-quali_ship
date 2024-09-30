const puppeteer = require('puppeteer');
const { checkForNewReclamations, uploadToSftp } = require('../../sftp/sftpClientColissimo');
const fs = require('fs');
const path = require('path');

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}

async function loginColissimoForFile(filePath, fileName) {
  const hasNewReclamations = await checkForNewReclamations();
  if (hasNewReclamations) {
    const browser = await puppeteer.launch({ headless: false });
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

        // Étape 10 : Cliquer sur le bouton de recherche
        await page.waitForSelector('#ewe-header-angular-search-open-button', { visible: true, timeout: 60000 });
        await page.click('#ewe-header-angular-search-open-button');

        await delay(1000);

        // Étape 11 : Cliquer sur "Service clients"
        await page.waitForSelector('#header-lin-service-clients', { visible: true, timeout: 60000 });
        await page.$eval('#header-lin-service-clients', (element) => element.click());

        await delay(1000);

        // Étape 12 : Cliquer sur le bouton de fermeture du menu mobile
        await page.waitForSelector('#ewe-header-angular-mobile-menu-close-button', { visible: true, timeout: 60000 });
        await page.click('#ewe-header-angular-mobile-menu-close-button'), (element) => element.click();
        await delay(1000);

        // Étape 13 : Cliquer sur "Déposer une demande"
        await page.waitForSelector('#service-lin-Déposer\\ une\\ demande > mat-card-header > div.mat-card-header-text > mat-card-title', { visible: true, timeout: 60000 });
        await page.$eval('#service-lin-Déposer\\ une\\ demande > mat-card-header > div.mat-card-header-text > mat-card-title', (element) => element.click());
        console.log('Page des réclamations en masse chargée avec succès.');
        await delay(1000);

        // Étape 14 : Cliquer sur le bouton "Fichier" et uploader le fichier
        await page.waitForSelector('#file', { visible: true, timeout: 60000 });
        const fileInput = await page.$('#file');  // Récupérer l'élément du fichier

        await fileInput.uploadFile(filePath);  // Uploader le fichier
        console.log(`Fichier uploadé avec succès : ${fileName}`);

        await delay(1000);
        // étape 15 : cliquer sur importer 
        await page.waitForSelector('#service-depot-btn-importer > span.mat-button-wrapper', { visible: true, timeout: 60000 });
        await page.$eval('#service-depot-btn-importer > span.mat-button-wrapper', (element) => element.click());
        console.log('fichier bien envoyer !.');
        await delay(1000);  // Attendre 1 secondes avant de supprimer le fichier

        // étape 16 : cliquer sur continuer
        await page.waitForSelector('#mat-dialog-0 > app-dialog > div.footer > button:nth-child(2)', { visible: true, timeout: 60000 });
        await page.$eval('#mat-dialog-0 > app-dialog > div.footer > button:nth-child(2)', (element) => element.click());
        await delay(1000);

        // étape 17 : cliquer sur OK 
        await page.waitForSelector('#mat-dialog-1 > app-dialog > div.footer > button', { visible: true, timeout: 60000 });
        await page.$eval('#mat-dialog-1 > app-dialog > div.footer > button', (element) => element.click());
        await delay(1000);

        // étape 18 : Lancer le téléchargement 
        await page.waitForSelector('#service-depot-lin-telecharger', { visible: true, timeout: 60000 });
        await page.$eval('#service-depot-lin-telecharger', (element) => element.click());
        await delay(1000);
        console.log('Téléchargement terminé');

        // Chercher le fichier téléchargé dans le dossier temporaire
      const downloadedFiles = fs.readdirSync(tempDownloadPath);
      const exportFile = downloadedFiles.find(
        (file) => file.startsWith("IMPORT") && file.endsWith(".csv")
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
      }catch (error) {
        console.error('Erreur lors du transfert du fichier SFTP:', error);
      }
    } else {
      console.log('Aucun fichier CSV trouvé dans le répertoire.');
    }

        // Supprimer le fichier local après l'attente
        try {
          fs.unlinkSync(filePath);
          console.log(`Fichier supprimé : ${filePath}`);
        } catch (err) {
          console.error(`Erreur lors de la suppression du fichier : ${err.message}`);
        }
        
        // Attendre 10 secondes
        await delay(60000);
      } else {
        console.log('Connexion échouée.');
      }

    } catch (error) {
      console.error(`Erreur lors de la tentative de connexion pour ${fileName}:`, error);  // Utilisation correcte de fileName
    } finally {
      await browser.close();
    }
  }
}

async function loginColissimo() {
  const hasNewReclamations = await checkForNewReclamations();
  if (hasNewReclamations) {
    // Récupérer tous les fichiers dans le répertoire "dossierReclamation"
    const reclamationFolderPath = 'C:/Users/badao/Desktop/bot-quali-ship/src/dossierReclamation';
    const files = fs.readdirSync(reclamationFolderPath);

    // Rechercher les fichiers avec le format "colis_reclamation_*.csv"
    const reclamationFiles = files.filter(file => file.startsWith('colis_reclamation_') && file.endsWith('.csv'));

    if (reclamationFiles.length > 0) {
      for (const fileName of reclamationFiles) {
        const filePath = path.join(reclamationFolderPath, fileName);

        // Lancer une nouvelle page pour chaque fichier
        console.log(`Traitement du fichier : ${fileName}`);
        await loginColissimoForFile(filePath, fileName);

        // Attendre un petit délai entre chaque traitement
        await delay(5000); // Attendre 5 secondes avant de passer au fichier suivant
      }
    } else {
      console.log('Aucun fichier à uploader trouvé.');
    }
  } else {
    console.log('Aucune nouvelle réclamation trouvée, quitter le bot');
    process.exit(0);
  }
}

// Lancer le bot
module.exports = loginColissimo, loginColissimoForFile;