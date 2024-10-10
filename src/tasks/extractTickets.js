const logger = require("../utils/logger");

// Fonction de délai pour attendre quelques secondes si nécessaire
async function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function extractMultipleShipmentNumbers(page) {
  let refundStatus = "0";
  let shipmentNumbers = []; // Initialiser un tableau pour stocker les numéros d'envoi et statuts

  try {
    // Étape 1 : Vérifier si le bouton "Afficher les statuts" est présent
    console.log(
      'Etape 1 : Vérification de la présence du bouton "Afficher les statuts"...'
    );
    const hoverSelector =
      "#form2 > div.comment-top > div:nth-child(1) > div > p > span.sm-table-cell.info-text.sm-hidden > span";

    const isHoverVisible = await page.evaluate((selector) => {
      return document.querySelector(selector) !== null;
    }, hoverSelector);

    if (isHoverVisible) {
      console.log(
        'Etape 2 : Bouton "Afficher les statuts" trouvé, tentative de survol...'
      );

      try {
        // Étape 3 : Attendre que l'élément soit visible puis le survoler
        console.log("Etape 3 : En attente du sélecteur pour survol...");
        await page.waitForSelector(hoverSelector, {
          visible: true,
          timeout: 5000,
        });
        console.log("Sélecteur trouvé, survol en cours...");
        await page.hover(hoverSelector);
        console.log("Survol réussi, attente du popup...");
        await delay(5000); // Attendre que le popup apparaisse

        // Étape 4 : Extraire les informations des numéros d'envoi et des statuts
        console.log(
          "Etape 4 : Extraction des numéros d'envoi et des statuts..."
        );
        const refunds = await page.evaluate(() => {
          const refundRows = Array.from(
            document.querySelectorAll(
              "#form2 > div.comment-top > div:nth-child(1) > div > p > span.lg-hidden.sm-table-cell > span"
            )
          );

          return refundRows.map((row) => row.innerText.trim()); // Extraire et nettoyer le texte de chaque élément
        });
        console.log("Extraction réussie.");

        // Étape 5 : Traiter les données extraites
        console.log("Etape 5 : Traitement des données extraites...");
        refunds.forEach((refund, index) => {
          const parts = refund.split(":"); // Séparer numéro d'envoi et statut

          if (parts.length === 2) {
            const shipmentNumber = parts[0].trim();
            const status = parts[1].trim();
            console.log(
              `Numéro d'envoi : ${shipmentNumber} - Statut : ${status}`
            );

            shipmentNumbers.push({ shipmentNumber, status });

            // Si le statut est "Validé", on considère que le remboursement est validé
            if (status === "Validé") {
              refundStatus = "1";
            }
          } else {
            console.log(`Erreur de format pour l'entrée : ${refund}`);
          }
        });
        console.log("Traitement des données terminé.");

        // Étape 6 : Loguer les numéros d'envoi collectés
        console.log("Etape 6 : Log des numéros d'envoi...");
        logger.info("Numéros d'envoi : " + JSON.stringify(shipmentNumbers));
      } catch (hoverError) {
        console.error(
          "Erreur lors du survol pour afficher les statuts : " +
            hoverError.message
        );
      }
    } else {
      console.log(
        'Etape 2b : Le bouton "Afficher les statuts" n\'est pas visible, utilisation de la méthode alternative...'
      );
      const { shipmentNumber, refundStatus: altRefundStatus } =
        await extractSingleShipmentNumber(page);
      refundStatus = altRefundStatus;
      shipmentNumbers.push({ shipmentNumber, status: refundStatus });
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du statut de remboursement : " +
        error.message
    );
  }

  return { refundStatus, shipmentNumbers }; // Toujours retourner les numéros d'envoi et statuts
}

async function extractSingleShipmentNumber(page) {
  let shipmentNumber = "";
  let refundStatus = "0";

  try {
    // Étape 1 : Récupérer le numéro d'envoi
    console.log("Etape 1 : Extraction du numéro d'envoi...");
    shipmentNumber = await page.$eval(
      "#tab2 > div > div.ticket-infos > ul > li.package-number-info > span > a",
      (element) =>
        element.textContent
          .replace("N° d'envoi :", "")
          .replace(/\u00A0/g, "")
          .trim()
    );
    console.log("Numéro d'envoi extrait :", shipmentNumber);

    // Étape 2 : Récupérer le statut du remboursement
    console.log("Etape 2 : Extraction du statut du remboursement...");
    try {
      refundStatus = await page.$eval(
        "#form2 > div.comment-top > div:nth-child(1) > p:nth-child(2) > span > span",
        (element) => element.textContent.trim()
      );
      console.log("Statut du remboursement :", refundStatus);

      if (refundStatus === "Validé") {
        refundStatus = "1";
      }
    } catch (error) {
      console.log("Premier sélecteur échoué, utilisation du second...");

      refundStatus = await page.$eval(
        "#form2 > div.comment-top > div:nth-child(1) > p:nth-child(2) > span > span",
        (element) => element.textContent.trim()
      );
      console.log(
        "Statut du remboursement (Deuxième sélecteur) :",
        refundStatus
      );

      if (refundStatus === "Validé") {
        refundStatus = "1";
      }
    }
  } catch (error) {
    console.error(
      "Erreur lors de l'extraction du numéro d'envoi ou du statut : " +
        error.message
    );
  }

  return { shipmentNumber, refundStatus };
}

module.exports = {
  extractMultipleShipmentNumbers,
  extractSingleShipmentNumber,
};
