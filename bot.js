const loginChronopostExport = require('./src/transporters/chronopost/chronopostExport');
const loginChronopostImport = require('./src/transporters/chronopost/chronopostImport');
const loginColissimoExport = require('./src/transporters/colissimo/colissimoExport');
const loginColissimoImport = require('./src/transporters/colissimo/colissimoImport');
const logger = require('./src/utils/logger');

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
  try {
    logger.info('Lancement de l\'export de Colissimo...');
    await loginColissimoExport();
    logger.info('Export de Colissimo terminé avec succès.');
  } catch (error) {
    logger.warn('Erreur ou absence de nouvelles réclamations lors de l\'export de Colissimo :', error.message);
  }

  // Lancer Colissimo Import indépendamment
  // try {
  //   logger.info('Lancement de l\'import de Colissimo...');
  //   await loginColissimoImport();
  //   logger.info('Import de Colissimo terminé avec succès.');
  // } catch (error) {
  //   logger.warn('Erreur lors de l\'import de Colissimo :', error.message);
  // }
  

  

  logger.info('Toutes les opérations ont été effectuées (qu\'elles aient réussi ou échoué).');
}

startAutomation();
