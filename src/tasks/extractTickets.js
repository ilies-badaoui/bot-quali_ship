const logger = require("../utils/logger");

// Fonction de délai pour attendre quelques secondes si nécessaire
async function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function extractMultipleShipmentNumbers(page) {
  let refundStatus = "0";
  let shipmentNumbers = []; // Initialiser un tableau pour stocker les numéros d'envoi et statuts

  try {
    // Sélecteur pour le survol
    const hoverSelector =
      "#form2 > div.comment-top > div:nth-child(1) > div > p > span.sm-table-cell.info-text.sm-hidden > span";

    // Vérifier si le bouton "Afficher les statuts" est visible
    const isHoverVisible = await page.evaluate((selector) => {
      return document.querySelector(selector) !== null;
    }, hoverSelector);

    if (isHoverVisible) {
      console.log(
        "Le bouton 'Afficher les statuts' est présent, tentative de survol..."
      );

      try {
        // Survoler pour faire apparaître le popup
        await page.waitForSelector(hoverSelector, {
          visible: true,
          timeout: 5000,
        });
        await page.hover(hoverSelector);
        await delay(5000); // Attendre que le popup apparaisse

        // Sélectionner séparément les numéros d'envoi et leurs statuts
        const refunds = await page.evaluate(() => {
          const refundRows = Array.from(
            document.querySelectorAll(
              "#form2 > div.comment-top > div:nth-child(1) > div > p > span.lg-hidden.sm-table-cell > span"
            )
          );

          return refundRows.map((row) => {
            const text = row.innerText.trim();
            return text;
          });
        });

        // Traiter les remboursements (séparation des numéros d'envoi et des statuts)
        refunds.forEach((refund, index) => {
          const parts = refund.split(":"); // Séparer numéro d'envoi et statut

          if (parts.length === 2) {
            // Si on a bien un numéro d'envoi et un statut
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

        // Si vous voulez seulement les numéros d'envoi (sans les statuts)
        const shipmentNumbersList = shipmentNumbers.map(
          (item) => item.shipmentNumber
        );
      } catch (hoverError) {
        console.error(
          "Erreur lors du survol pour afficher les statuts : " +
            hoverError.message
        );
      }
    } else {
      // Si le hover n'est pas visible, utiliser extractSingleShipmentNumber
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
    // Récupérer le N° d'envoi et supprimer tout texte supplémentaire comme "N° d'envoi : " et les espaces insécables
    shipmentNumber = await page.$eval(
      "#tab2 > div > div.ticket-infos > ul > li.package-number-info > span > a",
      (element) =>
        element.textContent
          .replace("N° d'envoi :", "")
          .replace(/\u00A0/g, "")
          .trim()
    );
    console.log("Numéro d'envoi extrait :", shipmentNumber);

    // Récupérer le statut du remboursement
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
      "Erreur lors de la récupération du numéro d'envoi :",
      error.message
    );
  }

  return { shipmentNumber, refundStatus };
}

module.exports = {
  extractMultipleShipmentNumbers,
  extractSingleShipmentNumber,
};
