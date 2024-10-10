const puppeteer = require("puppeteer");
const { checkForNewReclamations } = require("../../sftp/sftpClientChronopost");
const fs = require("fs");
const path = require("path");
const { loginChronopost } = require("../../utils/connexion/chronopostLogin");

async function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function loginChronopostExport() {
  const downloadedFiles = await checkForNewReclamations();
  if (downloadedFiles.length > 0) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
      await loginChronopost(page);

      // Aller sur la page d'import
      await page.goto(
        "https://www.chronopost.fr/service-client-en-ligne/import.html?locale=fr_FR"
      );

      // Attendre que le bouton "Choisissez un fichier" soit disponible
      await page.waitForSelector('input[id^="ajax-upload-id-"]', {
        visible: true,
      });

      // Obtenir l'élément de fichier pour l'upload
      const fileInput = await page.$('input[id^="ajax-upload-id-"]');

      for (const filePath of downloadedFiles) {
        if (fs.existsSync(filePath)) {
          await fileInput.uploadFile(filePath); // Uploader le fichier
          console.log(
            `Fichier uploadé avec succès sur Chronopost: ${filePath}`
          );

          // Attendre un peu avant de supprimer le fichier
          await delay(5000); // Attendre 5 secondes pour être sûr que le fichier est libéré

          // Supprimer le fichier local après importation
          fs.unlinkSync(filePath);
          console.log(`Fichier local supprimé: ${filePath}`);
        } else {
          console.error(`Le fichier à uploader est introuvable: ${filePath}`);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'exécution du bot:", error);
    } finally {
      await delay(5000).then(() => {
        browser.close();
      });
    }
  } else {
    console.log("Aucune nouvelle réclamation trouvée, quitter le bot");
    process.exit(0);
  }
}

// Lancer le bot
module.exports = loginChronopostExport;
