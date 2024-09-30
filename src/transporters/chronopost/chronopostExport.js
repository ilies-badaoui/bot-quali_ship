const puppeteer = require("puppeteer");
const { checkForNewReclamations } = require("../../sftp/sftpClientChronopost");
const fs = require("fs");
const path = require("path");

function delay(time) {
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
      await page.goto("https://www.chronopost.fr/fr/authentification", {
        waitUntil: "networkidle2", // Attendre que la page soit complètement chargée
      });

      // Cliquer sur "Tout accepter" (cookies)
      await page.waitForSelector("a.btn.btn-rectangle", {
        visible: true,
        timeout: 60000, // Timeout après 60 secondes si l'élément n'apparaît pas
      });
      await page.click("a.btn.btn-rectangle"); // Cliquer sur "Tout accepter"

      // Attendre que le champ identifiant soit disponible
      await page.waitForSelector(
        "div.iv4-login-form:nth-child(3) > span:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > input:nth-child(1)"
      );

      // Remplir le champ identifiant
      await page.type(
        "div.iv4-login-form:nth-child(3) > span:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > input:nth-child(1)",
        "stephane@frenchlog.com"
      );

      // Attendre que le champ mot de passe soit disponible
      await page.waitForSelector(
        "div.iv4-login-form:nth-child(3) > span:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > input:nth-child(1)"
      );

      // Remplir le champ mot de passe
      await page.type(
        "div.iv4-login-form:nth-child(3) > span:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > input:nth-child(1)",
        "chronopost"
      );

      // Attendre que le bouton de connexion soit visible et cliquable
      await page.waitForSelector(
        "#ch-first-col > div > div.ch-content-base > div > div > div.ch-wysiwyg > div > div > div > div > span > div > div > button",
        { visible: true }
      );

      // Cliquer sur le bouton de connexion
      await page.click(
        "#ch-first-col > div > div.ch-content-base > div > div > div.ch-wysiwyg > div > div > div > div > span > div > div > button"
      );

      console.log("Connexion réussie !");

      // Attendre que la connexion soit terminée
      await page.waitForNavigation();

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
