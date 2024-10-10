const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { uploadToSftp } = require("../../sftp/sftpClientChronopost");
const logger = require("../../utils/logger");
const { loginChronopost } = require("../../utils/connexion/chronopostLogin");
const {
  extractMultipleShipmentNumbers,
  extractSingleShipmentNumber,
} = require("../../tasks/extractTickets");

const outputCSVPath = path.resolve(
  "C:/Users/Tony/Documents/bot-quali_ship/bot-quali_ship/src/transporters/chronopost/temp_download/ticket_info.csv"
);

// Fonction de délai pour attendre quelques secondes si nécessaire
async function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// Fonction principale pour gérer la connexion et les actions sur Chronopost
async function loginChronopostTickets() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    logger.info(
      "Démarrage du bot - Accès à la page de connexion de Chronopost."
    );

    // Étape 1 : Connexion à Chronopost
    console.log("Etape 1 : Connexion au site Chronopost...");
    await loginChronopost(page);

    // Étape 2 : Accéder au tableau de synthèse
    console.log("Etape 2 : Accès au Tableau de Synthèse...");
    logger.info("Accès à la page Tableau de Synthèse.");
    await page.goto(
      "https://www.chronopost.fr/service-client-en-ligne/import.html?locale=fr_FR",
      {
        waitUntil: "networkidle2",
        timeout: 60000,
      }
    );
    await page.waitForSelector("#summary-menu", { visible: true });
    await page.click("#summary-menu");
    logger.info("Accès au Tableau de synthèse réussi.");

    // Étape 3 : Sélectionner toutes les réclamations
    console.log("Etape 3 : Sélection de toutes les réclamations...");
    await delay(1000);
    await page.waitForSelector("#table1_length > label > select");
    await page.select("#table1_length > label > select", "200");
    logger.info("Toutes les réclamations affichées.");

    // Initialiser `csvData`
    const csvData = [];
    let ticketIndex = 0;

    // Étape 4 : Boucle pour traiter chaque ticket
    console.log("Etape 4 : Début de la boucle pour traiter chaque ticket...");
    while (true) {
      // Récupérer la liste des sélecteurs de tickets
      console.log(`Traitement du ticket index : ${ticketIndex}`);
      const ticketSelectors = await page.$$eval(
        "#table1 > tbody > tr > td:nth-child(3) > a",
        (links) =>
          links.map(
            (link, index) =>
              `#table1 > tbody > tr:nth-child(${
                index + 1
              }) > td:nth-child(3) > a`
          )
      );

      if (ticketIndex >= ticketSelectors.length) break; // Si tous les tickets sont traités, sortir de la boucle

      const selector = ticketSelectors[ticketIndex];

      // Étape 5 : Attendre que le sélecteur du ticket soit visible
      console.log(
        `Etape 5 : Attente de la visibilité du sélecteur du ticket ${ticketIndex}...`
      );
      await page.waitForSelector(selector, { visible: true });

      // Étape 6 : Extraire le texte du numéro de ticket avant de cliquer
      console.log("Etape 6 : Extraction du numéro de ticket...");
      const ticketNumber = await page.evaluate((sel) => {
        return document.querySelector(sel).textContent.trim();
      }, selector);
      console.log(`Numéro de ticket extrait : ${ticketNumber}`);

      // Étape 7 : Cliquer sur le ticket
      console.log("Etape 7 : Clic sur le ticket...");
      await page.click(selector);
      logger.info("Clique sur le ticket : " + ticketNumber);

      await delay(8000); // Attendre le chargement de la page de détail

      // Étape 8 : Extraire les informations du ticket
      console.log("Etape 8 : Extraction des informations du ticket...");
      const { refundStatus, shipmentNumbers } =
        await extractMultipleShipmentNumbers(page);
      logger.info("Numéros d'envoi : " + JSON.stringify(shipmentNumbers));

      // Ajouter les informations extraites au CSV
      shipmentNumbers.forEach((shipmentNumber) => {
        csvData.push({
          Ticket: ticketNumber,
          "N° d'envoi": shipmentNumber.shipmentNumber || shipmentNumber,
          Remboursement: refundStatus,
        });
      });

      // Étape 9 : Revenir au tableau de synthèse
      console.log("Etape 9 : Retour au tableau de synthèse...");
      try {
        await page.click("#summary-menu");
        await delay(5000);
      } catch (navError) {
        console.error(
          "Erreur lors du retour au tableau de synthèse : " + navError.message
        );
      }

      ticketIndex++; // Passer au ticket suivant
    }

    // Étape 10 : Générer le fichier CSV avec les informations extraites
    console.log("Etape 10 : Génération du fichier CSV...");
    await generateCSV(csvData);
    logger.info("Fichier CSV généré avec succès.");

    // Étape 11 : Transférer le fichier vers le serveur SFTP
    console.log("Etape 11 : Transfert du fichier vers le serveur SFTP...");
    await uploadToSftp(outputCSVPath);
  } catch (error) {
    console.error(`Erreur lors de l'exécution du bot : ${error.message}`);
  } finally {
    // Étape finale : Fermeture du navigateur
    console.log("Etape finale : Fermeture du navigateur...");
    logger.info("Fermeture du navigateur...");
    await delay(6000);
    await browser.close();
    logger.info("Bot terminé.");
  }
}

// Fonction pour créer le fichier CSV sans dépendances externes
async function generateCSV(data) {
  try {
    const headers = ["Ticket", "N d'envoi", "Remboursement"];
    const csvRows = [
      headers.join(";"),
      ...data.map((row) => {
        let ticket = row.Ticket
          ? row.Ticket.replace(
              /[^         let ticket = row.Ticket ? row.Ticket.replace(/[^\x20-~        let ticket = row.Ticket ? row.Ticket.replace(/[^\x20-\x7E]/g,
              ""
            ).trim()
          : "";
        let shipmentNumbers = row["N° d'envoi"]
          ? row["N° d'envoi"]
              .replace(/[^\x20-\x7E]/g, "") // Retirer les caractères non imprimables
              .replace("N° d'envoi : ", "")
              .trim()
          : "";
        let refundStatus = row.Remboursement
          ? row.Remboursement.toString()
              .replace(
                /[^         let refundStatus = row.Remboursement ? row.Remboursement.toString().replace(/[^\x20-~        let refundStatus = row.Remboursement ? row.Remboursement.toString().replace(/[^\x20-\x7E]/g,
                ""
              )
              .trim()
          : "";

        return [ticket, shipmentNumbers, refundStatus].join(";");
      }),
    ];

    fs.writeFileSync(outputCSVPath, csvRows.join("\n"), { encoding: "utf8" });
    console.log(`Fichier CSV créé avec succès : ${outputCSVPath}`);
  } catch (error) {
    console.error(
      "Erreur lors de la création du fichier CSV : " + error.message
    );
  }
}

// Exporter la fonction principale
module.exports = loginChronopostTickets;
