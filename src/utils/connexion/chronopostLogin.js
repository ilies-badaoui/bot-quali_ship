// chronopostLogin.js
const logger = require("../logger");

// Fonction de connexion à Chronopost
async function loginChronopost(page) {
  try {
    logger.info(
      "Démarrage du bot - Accès à la page de connexion de Chronopost."
    );

    // Aller sur la page de connexion de Chronopost
    await page.goto("https://www.chronopost.fr/fr/authentification", {
      waitUntil: "networkidle2",
    });

    // Cliquer sur "Tout accepter" (cookies)
    await page.waitForSelector("a.btn.btn-rectangle", {
      visible: true,
      timeout: 60000,
    });
    await page.click("a.btn.btn-rectangle");

    // Saisir les identifiants de connexion
    logger.info("Tentative de connexion à Chronopost...");
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

    await page.waitForNavigation({ waitUntil: "networkidle2" });
    logger.info("Connexion réussie.");
  } catch (error) {
    logger.error(`Erreur lors de la connexion : ${error.message}`);
    throw error;
  }
}

// Exporter la fonction de connexion
module.exports = {
  loginChronopost,
};
