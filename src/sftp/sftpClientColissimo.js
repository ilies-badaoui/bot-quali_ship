const path = require('path');
const Client = require('ssh2-sftp-client');
const sftp = new Client();

async function checkForNewReclamations() {
  try {
    await sftp.connect({
      host: '152.228.216.3',
      port: '22',
      username: 'test',
      password: 'JC<2AI$WR+5Fe^LW'
    });
    
    const fileList = await sftp.list('/test/export/laposte');
    const newReclamations = fileList.filter(file => file.name.startsWith('colis_reclamation_') && file.name.endsWith('.csv'));
    
    if (newReclamations.length > 0) {
      console.log(`Trouvé ${newReclamations.length} nouvelles réclamations`);
      
      // Télécharge les nouvelles réclamations
      for (const file of newReclamations) {
        const remoteFilePath = `/test/export/laposte/${file.name}`;
        const localFilePath = `C:/Users/badao/Desktop/bot-quali-ship/src/dossierReclamation/${file.name}`;
        await sftp.get(remoteFilePath, localFilePath);
        console.log(`Téléchargé ${file.name} dans ${localFilePath}`);
      }
      return true; // Nouvelles réclamations trouvées
    } else {
      console.log('Aucune nouvelle réclamation trouvée');
      return false; // Aucune nouvelle réclamation trouvée
    }
    
  } catch (err) {
    console.error('Erreur SFTP:', err);
    return false; // Erreur survenue
    
  } finally {
    // Fermer la connexion SFTP après le traitement, que ce soit une réussite ou une erreur
    await sftp.end();
  }
}

async function getFileFromSFTP() {
    try {
        await sftp.connect({
            host: '152.228.216.3',
            port: '22',
            username: 'test',
            password: 'JC<2AI$WR+5Fe^LW'
        });
        const fileList = await sftp.list('/test/export/LaPoste');
        console.log('Files:', fileList);
        const remoteFilePath = '/test/export/LaPoste/colis_reclamation_957134_1.csv';
        const localFilePath = 'C:/Users/badao/Desktop/bot-quali-ship/src/dossierReclamation/colis_reclamation_957134.csv';
        await sftp.get(remoteFilePath, localFilePath);
        console.log('Fichier téléchargé dans le répertoire dossierReclamation');
        await sftp.end();
    } catch (err) {
        console.error('SFTP error:', err);
    }
}


async function uploadToSftp(finalDownloadPath) {
  const config = {
    host: '152.228.216.3',
    port: '22',
    username: 'test',
    password: 'JC<2AI$WR+5Fe^LW'
  };

  const remoteFilePath = '/test/import/laposte/' + path.basename(finalDownloadPath);

  try {
    await sftp.connect(config);
    console.log('Connexion SFTP réussie');

    // Transférer le fichier CSV
    await sftp.put(finalDownloadPath, remoteFilePath);
    console.log('Fichier transféré avec succès vers:', remoteFilePath);

    await sftp.end();
  } catch (err) {
    console.error('Erreur lors du transfert SFTP :', err);
  }
}


module.exports = { getFileFromSFTP ,checkForNewReclamations, uploadToSftp};
