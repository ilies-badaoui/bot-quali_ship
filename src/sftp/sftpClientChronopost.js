const Client = require("ssh2-sftp-client");
const sftp = new Client();
const path = require("path");
const fs = require("fs");

async function checkForNewReclamations() {
  try {
    await sftp.connect({
      host: "152.228.216.3",
      port: "22",
      username: "test",
      password: "JC<2AI$WR+5Fe^LW",
    });
    const fileList = await sftp.list("/test/export/chronopost");
    const newReclamations = fileList.filter(
      (file) =>
        file.name.startsWith("colis_reclamation_") && file.name.endsWith(".csv")
    );

    const downloadedFiles = [];

    if (newReclamations.length > 0) {
      console.log(`Trouvé ${newReclamations.length} nouvelles réclamation`);
      // Téléchargez les nouvelles réclamations
      for (const file of newReclamations) {
        const remoteFilePath = `/test/export/chronopost/${file.name}`;
        const localFilePath = `C:/Users/Tony/Desktop/bot-quali-ship/src/dossierReclamation/${file.name}`;
        await sftp.get(remoteFilePath, localFilePath);
        console.log(`Téléchargé ${file.name} dans ${localFilePath}`);
        downloadedFiles.push(localFilePath); // Ajouter le chemin local du fichier téléchargé
      }
      await sftp.end();
      return downloadedFiles; // Retourner la liste des fichiers téléchargés
    } else {
      console.log("Aucune nouvelle réclamation trouvée");
      await sftp.end();
      return []; // Aucune nouvelle réclamation trouvée
    }
  } catch (err) {
    console.error("Erreur SFTP:", err);
    return [];
  }
}

async function getFileFromSFTP() {
  try {
    await sftp.connect({
      host: "152.228.216.3",
      port: "22",
      username: "test",
      password: "JC<2AI$WR+5Fe^LW",
    });
    const fileList = await sftp.list("/test/export/chronopost");
    console.log("Files:", fileList);
    const remoteFilePath =
      "/test/export/chronopost/colis_reclamation_Chrono_20240920142700.csv";
    const localFilePath =
      "C:/Users/Tony/Desktop/bot-quali-ship/src/dossierReclamation/colis_reclamation_Chrono_20240920142700.csv";
    await sftp.get(remoteFilePath, localFilePath);
    console.log("Fichier téléchargé dans le répertoire dossierReclamation");

    // Supprimer le fichier local après transfert
    fs.unlinkSync(localFilePath); // Correction de la variable utilisée
    console.log(`Fichier local supprimé: ${localFilePath}`);

    await sftp.end();
  } catch (err) {
    console.error("SFTP error:", err);
  }
}

async function uploadToSftp(finalDownloadPath) {
  const config = {
    host: "152.228.216.3",
    port: "22",
    username: "test",
    password: "JC<2AI$WR+5Fe^LW",
  };

  const remoteFilePath =
    "/test/import/chronopost/" + path.basename(finalDownloadPath);

  try {
    await sftp.connect(config);
    console.log("Connexion SFTP réussie");

    // Transférer le fichier CSV
    await sftp.put(finalDownloadPath, remoteFilePath);
    console.log("Fichier transféré avec succès vers:", remoteFilePath);

    // Supprimer le fichier local après transfert
    fs.unlinkSync(finalDownloadPath); // Correction de la variable utilisée
    console.log(`Fichier local supprimé: ${finalDownloadPath}`);

    await sftp.end();
  } catch (err) {
    console.error("Erreur lors du transfert SFTP :", err);
  }
}

module.exports = { getFileFromSFTP, checkForNewReclamations, uploadToSftp };
