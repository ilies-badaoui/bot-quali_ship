const loginChronopostExport = require('./src/transporters/chronopost/chronopostExport');
const loginChronopostImport = require('./src/transporters/chronopost/chronopostImport');
const loginColissimoExport = require('./src/transporters/colissimo/colissimoExport');
const loginColissimoImport = require('./src/transporters/colissimo/colissimoImport');
const loginAndNavigateToClaims = require('./src/transporters/colissimo/colissimoSuivi');
const glsExport = require('./src/transporters/gls/glsExport');
const glsImport = require('./src/transporters/gls/glsImport');
const glsSuivi = require('./src/transporters/gls/glsSuivi');
const logger = require('./src/utils/logger');
const { retryOperation } = require('./src/utils/retry');

async function startAutomation() {
  logger.info('Démarrage de toutes les opérations des bots...');

  // Lancer Chronopost Export indépendamment
  // try {
  //   logger.info('Lancement de l\'export de Chronopost...');
  //   await loginChronopostExport();
  //   logger.info('Export de Chronopost terminé avec succès.');
  // } catch (error) {
  //   logger.warn('Erreur ou absence de nouvelles réclamations lors de l\'export de Chronopost :', error.message);
  // }

  // Lancer Chronopost Import indépendamment
  // try {
  //   logger.info('Lancement de l\'import de Chronopost...');
  //   await loginChronopostImport();
  //   logger.info('Import de Chronopost terminé avec succès.');
  // } catch (error) {
  //   logger.warn('Erreur lors de l\'import de Chronopost :', error.message);
  // } 

  // Lancer Colissimo Export indépendamment
  // try {
  //   logger.info('Lancement de l\'export de Colissimo...');
  //   await loginColissimoExport();
  //   logger.info('Export de Colissimo terminé avec succès.');
  // } catch (error) {
  //   logger.warn('Erreur ou absence de nouvelles réclamations lors de l\'export de Colissimo :', error.message);
  // }

  // Lancer Colissimo Import indépendamment
  // try {
  //   logger.info('Lancement de l\'import de Colissimo...');
  //   await loginColissimoImport();
  //   logger.info('Import de Colissimo terminé avec succès.');
  // } catch (error) {
  //   logger.warn('Erreur lors de l\'import de Colissimo :', error.message);
  // }

  // Lancer Colissimo suivi indépendamment
  // try {
  //   logger.info('Lancement du suivi réclamation de Colissimo...');
  //   // Utiliser retryOperation pour lancer loginAndNavigateToClaims avec 3 tentatives maximum
  //   await retryOperation(loginAndNavigateToClaims, 3);
  //   logger.info('Le suivi est envoyer avec succes.');
  // } catch (error) {
  //   logger.warn('Erreur lors du suivi après plusieurs tentatives :', error.message);
  // }

  // Lancer GLS export indépendament
  // try {
  //   logger.info('Lancement de l\'export de GLS...');
  //   await glsExport();
  //   logger.info('Export de GLS terminé avec succès.');
  // } catch (error) {
  //   logger.warn('Erreur ou absence de nouvelles réclamations lors de l\'export de GLS', error.message);
  // }

  // Lancer GLS export indépendament
  // try {
  //   logger.info('Lancement de l\'import de GLS...');
  //   await glsImport();
  //   logger.info('Import de GLS terminé avec succès.');
  // } catch (error) {
  //   logger.warn('Erreur ou absence de nouvelles réclamations lors de l\'import de GLS', error.message);
  // }

  // Lancer le suivi de GLS indépendamment
  try {
    logger.info('Lancement de l\'envoi du suivi de GLS...');
    await glsSuivi();
    logger.info('suivi de GLS terminé avec succès.');
  } catch (error) {
    logger.warn('Erreur ou absence de nouvelles réclamations lors de l\'envoi du suivi de GLS', error.message);

  }




  logger.info('Toutes les opérations ont été effectuées (qu\'elles aient réussi ou échoué).');
}

startAutomation();
