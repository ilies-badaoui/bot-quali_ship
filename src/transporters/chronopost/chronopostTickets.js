const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { uploadToSftp } = require("../../sftp/sftpClientChronopost");
const logger = require("../../utils/logger");
const { loginChronopost } = require("../../utils/chronopostLogin");
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

    await loginChronopost(page);

    // Accéder au tableau de synthèse
    logger.info("Accès à la page Tableau de Synthèse.");
    await page.goto(
      "https://www.chronopost.fr/service-client-en-ligne/import.html?locale=fr_FR",
      { waitUntil: "networkidle2", timeout: 60000 }
    );
    await page.waitForSelector("#summary-menu", { visible: true });
    await page.click("#summary-menu");
    logger.info("Accès au Tableau de synthèse réussi.");

    // Sélectionner toutes les réclamations
    await delay(1000);
    await page.waitForSelector("#table1_length > label > select");
    await page.select("#table1_length > label > select", "200");
    logger.info("Toutes les réclamations affichées.");

    // Initialiser `csvData`
    const csvData = [];

    let ticketIndex = 0;

    // Boucle pour traiter chaque ticket
    while (true) {
      // Récupérer la liste des sélecteurs de tickets
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

      // Si tous les tickets sont traités, on sort de la boucle
      if (ticketIndex >= ticketSelectors.length) break;

      const selector = ticketSelectors[ticketIndex];

      // Attendre que le sélecteur du ticket soit visible
      await page.waitForSelector(selector, { visible: true });

      // Extraire le texte du numéro de ticket avant de cliquer
      const ticketNumber = await page.evaluate((sel) => {
        return document.querySelector(sel).textContent.trim();
      }, selector);

      // Cliquer sur le ticket
      await page.click(selector);
      logger.info("Clique sur le ticket : " + ticketNumber);

      await delay(8000);

      const { refundStatus, shipmentNumbers } =
        await extractMultipleShipmentNumbers(page);

      logger.info("Statut de remboursement : ");
      logger.info(
        "Numéros d'envoi : " +
          (shipmentNumbers ? shipmentNumbers.join(", ") : "Aucun")
      );

      // Ajouter les informations extraites au CSV
      shipmentNumbers.forEach((shipmentNumber) => {
        csvData.push({
          Ticket: ticketNumber,
          "N° d'envoi": shipmentNumber.shipmentNumber || shipmentNumber, // On s'assure qu'il s'agit bien d'un string
          Remboursement: refundStatus, // Statut de remboursement (1 ou 0)
        });
      });

      // Revenir au tableau de synthèse
      try {
        await page.click("#summary-menu > span");
        await page.waitForNavigation({
          waitUntil: "networkidle2",
          timeout: 15000,
        });
      } catch (navError) {
        logger.error(
          "Erreur lors du retour au tableau de synthèse : " + navError.message
        );
      }

      ticketIndex++; // Passer au ticket suivant
    }

    // Générer le fichier CSV avec les informations extraites
    await generateCSV(csvData);
    logger.info("Fichier CSV généré avec succès.");

    // Transférer le fichier vers le serveur SFTP
    await uploadToSftp(outputCSVPath);
  } catch (error) {
    logger.error(`Erreur lors de l'exécution du bot : ${error.message}`);
  } finally {
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
      headers.join(";"), // En-têtes
      ...data.map((row) => {
        // Nettoyage complet des valeurs pour éviter les caractères indésirables
        let ticket = row.Ticket
          ? row.Ticket.replace(/[^\x20-\x7E]/g, "").trim()
          : "";
        let shipmentNumbers = row["N° d'envoi"]
          ? row["N° d'envoi"]
              .replace(/[^\x20-\x7E]/g, "")
              .replace("N° d'envoi : ", "") // Nettoyage pour supprimer "N° d'envoi"
              .trim()
          : "";
        let refundStatus = row.Remboursement
          ? row.Remboursement.toString()
              .replace(/[^\x20-\x7E]/g, "")
              .trim()
          : "";

        // Retourner la ligne CSV formatée et nettoyée
        return [ticket, shipmentNumbers, refundStatus].join(";");
      }),
    ];

    // Écrire le fichier CSV avec encodage UTF-8
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
