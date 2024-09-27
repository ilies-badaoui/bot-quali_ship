const sftpClient = require('../sftp/sftpClient');
const logger = require('../logger');  
const fs = require('fs');
const path = require('path');
require('dotenv').config();


async function importClaim(page) {
  try {
    logger.info('Démarrage de l\'importation de la réclamation...');
    await sftpClient.getFileFromSFTP();

    const filePath = path.resolve('C:/Users/badao/Desktop/bot-quali-ship/src/dossierReclamation/colis_reclamation_957134_1.csv');
    if (fs.existsSync(filePath)) {
      const fileInput = await page.$('#file');
      await fileInput.uploadFile(filePath);
      logger.info('Fichier uploadé avec succès.');
    } else {
      logger.error('Le fichier à uploader est introuvable.');
    }
  } catch (error) {
    logger.error('Erreur lors de l\'importation de la réclamation :', error);
  }
}

module.exports = { importClaim };
