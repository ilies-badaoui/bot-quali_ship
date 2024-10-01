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
    
    const fileList = await sftp.list('/test/export/laposte/new/');
    const newReclamations = fileList.filter(file => file.name.startsWith('colis_reclamation_') && file.name.endsWith('.csv'));
    
    if (newReclamations.length > 0) {
      console.log(`Trouvé ${newReclamations.length} nouvelles réclamations`);
      
      // Télécharge les nouvelles réclamations
      for (const file of newReclamations) {
        const remoteFilePath = `/test/export/laposte/new/${file.name}`;
        const localFilePath = `C:/Users/badao/Desktop/bot-quali-ship/src/dossierReclamation/${file.name}`;
        await sftp.get(remoteFilePath, localFilePath);
        console.log(`Téléchargé ${file.name} dans ${localFilePath}`);
      }
      return newReclamations.map(file => file.name); // Retourne la liste des fichiers téléchargés
    } else {
      console.log('Aucune nouvelle réclamation trouvée');
      return []; // Aucune nouvelle réclamation trouvée
    }
    
  } catch (err) {
    console.error('Erreur SFTP:', err);
    return [];
  } finally {
    await sftp.end();
  }
}

async function uploadToSftp(finalDownloadPath, originalExportFileName) {
  const config = {
    host: '152.228.216.3',
    port: '22',
    username: 'test',
    password: 'JC<2AI$WR+5Fe^LW'
  };

  const remoteFilePath = '/test/import/laposte/' + path.basename(finalDownloadPath);
  const sftpRemoteReclamationPath = `/test/export/laposte/new/${originalExportFileName}`;

  try {
    await sftp.connect(config);
    console.log('Connexion SFTP réussie');

    // Transférer le fichier CSV vers le répertoire de destination
    await sftp.put(finalDownloadPath, remoteFilePath);
    console.log('Fichier transféré avec succès vers:', remoteFilePath);

    // Supprimer le fichier de réclamation original sur le serveur SFTP après transfert
    await sftp.delete(sftpRemoteReclamationPath);
    console.log(`Fichier d'export réclamation supprimé sur le serveur SFTP : ${sftpRemoteReclamationPath}`);

    await sftp.end();
  } catch (err) {
    console.error('Erreur lors du transfert ou suppression SFTP :', err);
  }
}

module.exports = { checkForNewReclamations, uploadToSftp };
