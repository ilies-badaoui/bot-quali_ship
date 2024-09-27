const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { uploadToSftp } = require("../../sftp/sftpClient");

async function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function loginChronopostImport() {
  const browser = await puppeteer.launch({ headless: false }); // Mode visible
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

    // Aller sur la page de Chronopost et se connecter
    await page.goto("https://www.chronopost.fr/fr/authentification", {
      waitUntil: "networkidle2",
    });

    await page.waitForSelector("a.btn.btn-rectangle", {
      visible: true,
      timeout: 60000,
    });
    await page.click("a.btn.btn-rectangle");

    await page.type(
      "div.iv4-login-form:nth-child(3) > span:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > input:nth-child(1)",
      "stephane@frenchlog.com"
    );
    await page.type(
      "div.iv4-login-form:nth-child(3) > span:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > input:nth-child(1)",
      "chronopost"
    );
    await page.click(
      "#ch-first-col > div > div.ch-content-base > div > div > div.ch-wysiwyg > div > div > div > div > span > div > div > button"
    );

    await page.waitForNavigation();

    // Accéder au tableau de synthèse
    await page.goto(
      "https://www.chronopost.fr/service-client-en-ligne/import.html?locale=fr_FR",
      {
        waitUntil: "networkidle2",
      }
    );

    await page.waitForSelector("#summary-menu", { visible: true });
    await page.click("#summary-menu");
    console.log("Accès au Tableau de synthèse");

    await delay(1000);

    await page.waitForSelector("#table1_length > label > select");
    await page.select("#table1_length > label > select", "200");
    console.log("Toutes les réclamations sélectionnées.");

    await delay(1000);

    page.on("dialog", async (dialog) => {
      if (dialog.type() === "fileChooser") {
        await dialog.accept(
          "C:/Users/Tony/Desktop/bot-quali-ship/src/retourReclamation"
        );
      }
    });

    await page.click("#ToolTables_table1_0"); // Cliquer sur le bouton d'export Excel

    // Attendre que le fichier soit téléchargé
    await delay(10000);

    // Chercher le fichier téléchargé dans le dossier temporaire
    const downloadedFiles = fs.readdirSync(tempDownloadPath);
    const exportFile = downloadedFiles.find(
      (file) => file.startsWith("exportTickets") && file.endsWith(".csv")
    );

    if (exportFile) {
      console.log(`Fichier téléchargé : ${exportFile}`);

      // Chemin du fichier téléchargé
      const tempFilePath = path.join(tempDownloadPath, exportFile);
      // Chemin final dans le dossier retourReclamation
      const finalDownloadPath = path.join(
        "C:/Users/Tony/Desktop/bot-quali-ship/src/retourReclamation",
        exportFile
      );

      // Déplacer le fichier dans le dossier final
      fs.renameSync(tempFilePath, finalDownloadPath);
      console.log(`Fichier déplacé vers : ${finalDownloadPath}`);

      try {
        await uploadToSftp(finalDownloadPath); // Appel pour transférer le fichier SFTP
        console.log("Fichier transféré sur le serveur SFTP avec succès !");
      } catch (error) {
        console.error("Erreur lors du transfert du fichier SFTP:", error);
      }
    } else {
      console.log("Aucun fichier CSV trouvé dans le répertoire.");
      throw new Error("Fichier CSV non trouvé");
    }
  } catch (error) {
    console.error("Erreur lors de l'exécution du bot:", error);
  } finally {
    await delay(10000);
    await browser.close();
  }
}

module.exports = loginChronopostImport;
