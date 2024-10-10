const { sendErrorEmail } = require('./mailer');  // Si tu utilises un système d'alerte par email
const { delay } = require('./utils');  // Assure-toi d'avoir la fonction delay pour gérer l'attente entre les tentatives

async function retryOperation(operation, retries = 3) {
    let lastError;
    for (let attempt = 1; attempt <= retries; attempt++) {
        console.log(`*** Tentative ${attempt} sur ${retries} ***`);  // Log de début de tentative
        try {
            await operation();
            console.log(`Opération réussie à la tentative ${attempt}.`);  // Opération réussie
            return;
        } catch (error) {
            console.error(`Erreur lors de la tentative ${attempt} : ${error.message}`);
            lastError = error;
            if (attempt < retries) {
                console.log(`Nouvelle tentative dans 5 secondes...`);  // Log d'attente avant prochaine tentative
                await delay(5000);  // Attendre 5 secondes avant de réessayer
            }
        }
    }

    console.error(`Échec de l'opération après ${retries} tentatives.`);
    try {
        console.log('Tentative d\'envoi d\'un email d\'erreur au développeur...');
        await sendErrorEmail(lastError);  // Envoi d'un email avec l'erreur finale
    } catch (emailError) {
        console.error('Impossible d\'envoyer l\'email d\'erreur :', emailError);
    }

    throw lastError;  // Propager l'erreur après toutes les tentatives
}
module.exports = { retryOperation };
