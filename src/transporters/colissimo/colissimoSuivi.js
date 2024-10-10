const { getInProgressClaims } = require('../../sftp/sftpClientColissimo');
const colissimoLogin = require('../../utils/colissimoLogin');
const { delay } = require('../../utils/utils');


async function loginAndNavigateToClaims() {
        let browser;
        try {
            const { browser: browserInstance, page } = await colissimoLogin();
            browser = browserInstance;

        await delay(3000);

        // Ajout d'un listener pour les fermetures inattendues
        page.on('close', () => {
            console.log('La page a été fermée de manière inattendue.');
        });

        await page.waitForSelector('.button.button--primary.shepherd-button', { visible: true, timeout: 60000 });
        await page.click('.button.button--primary.shepherd-button');

        await page.waitForSelector('#didactitiel--2 > div.content > div.field.field--name-field-title.field--type-string.field--label-visually_hidden', { visible: true, timeout: 60000 });
        await page.click('#didactitiel--2 > div.content > div.field.field--name-field-title.field--type-string.field--label-visually_hidden');
        await delay(1000);

        await page.waitForSelector('#header-lin-service-clients', { visible: true, timeout: 60000 });
        await page.click('#header-lin-service-clients');
        await delay(1000);

        await page.evaluate(() => {
            const button = document.querySelector("#service-lin-Rechercher\\ une\\ demande > mat-card-header > div.mat-card-header-text > mat-card-title");
            if (button) {
                button.click();
            } else {
                throw new Error('Bouton "Rechercher" non trouvé');
            }
        });
        console.log('Page de suivi des réclamations en masse chargée avec succès.');
        await delay(3000);

        console.log('Étape 5 : En attente du sélecteur...');
        await page.waitForSelector('#mat-select-value-11 > span > span', { visible: true, timeout: 60000 });
        console.log('Sélecteur trouvé, clic en cours...');
        await page.click('#mat-select-value-11 > span > span');
        console.log('Clic réussi.');
        await delay(3000);

        console.log('Étape suivante 6 : ref demande');
        await page.waitForSelector('#mat-option-93 > span', { visible: true, timeout: 60000 });
        console.log('Sélecteur trouvé, clic en cours...');
        await page.click('#mat-option-93 > span');
        console.log('Clic réussi.');
        await delay(3000);

        const inProgressClaims = await getInProgressClaims();
        if (inProgressClaims.length > 0) {
            const { TicketNumber } = inProgressClaims[0]; // Utilise le premier numéro de ticket disponible
            console.log(`TicketNumber récupéré: ${TicketNumber}`);

            // Remplir le champ de recherche avec le numéro de ticket
            await page.waitForSelector('#recherche-chp-critere-num-dossier', { visible: true, timeout: 60000 });
            await page.type('#recherche-chp-critere-num-dossier', TicketNumber);
            await page.keyboard.press('Enter');
            console.log(`Recherche lancée pour le numéro de demande : ${TicketNumber}`);
        } else {
            console.log('Aucune réclamation en cours trouvée.');
        }
        await delay(3000);

        await page.waitForSelector('#recherche-bnt-ajouter-critere > span.mat-button-wrapper', { visible: true, timeout: 60000 });
        await page.click('#recherche-bnt-ajouter-critere > span.mat-button-wrapper');
        await delay(3000);

        console.log('Étape suivante 7 : En attente du sélecteur...');
        await page.waitForSelector('#cdk-accordion-child-4 > div > form > div.search-row > div.criteria-list > div:nth-child(4) > app-dynamic-input > div > div.criterion-selector.ng-star-inserted > mat-form-field > div > div.mat-form-field-flex.ng-tns-c125-66 > div.mat-form-field-infix.ng-tns-c125-66', { visible: true, timeout: 60000 });
        console.log('Sélecteur trouvé, clic en cours...');
        await page.click('#cdk-accordion-child-4 > div > form > div.search-row > div.criteria-list > div:nth-child(4) > app-dynamic-input > div > div.criterion-selector.ng-star-inserted > mat-form-field > div > div.mat-form-field-flex.ng-tns-c125-66 > div.mat-form-field-infix.ng-tns-c125-66');
        console.log('Clic réussi.');
        await delay(3000);

        console.log('Étape suivante 8 : statut');
        await page.waitForSelector('#mat-option-130 > span', { visible: true, timeout: 60000 });
        console.log('Sélecteur trouvé, clic en cours...');
        await page.click('#mat-option-130 > span');
        console.log('Clic réussi.');
        await delay(3000);

        console.log('Étape suivante 9 : selection statut');
        await page.waitForSelector('#cdk-accordion-child-4 > div > form > div.search-row > div.criteria-list > div:nth-child(4) > app-dynamic-input > div > div.flex > mat-form-field > div > div.mat-form-field-flex.ng-tns-c125-69 > div.mat-form-field-infix.ng-tns-c125-69', { visible: true, timeout: 60000 });
        console.log('Sélecteur trouvé, clic en cours...');
        await page.click('#cdk-accordion-child-4 > div > form > div.search-row > div.criteria-list > div:nth-child(4) > app-dynamic-input > div > div.flex > mat-form-field > div > div.mat-form-field-flex.ng-tns-c125-69 > div.mat-form-field-infix.ng-tns-c125-69');
        console.log('Clic réussi.');
        await delay(3000);

        console.log('Étape suivante 10 : selection créée');
        await page.waitForSelector('#mat-option-135 > span', { visible: true, timeout: 60000 });
        console.log('Sélecteur trouvé, clic en cours...');
        await page.click('#mat-option-135 > span');
        console.log('Clic réussi.');
        await delay(3000);

        console.log('Étape suivante 11 : selection prise en charge');
        await page.waitForSelector('#mat-option-136 > span', { visible: true, timeout: 60000 });
        console.log('Sélecteur trouvé, clic en cours...');
        await page.click('#mat-option-136 > span');
        console.log('Clic réussi.');
        await delay(3000);

        console.log('Étape suivante 12 : selection en cours de traitement');
        await page.waitForSelector('#mat-option-137 > span', { visible: true, timeout: 60000 });
        console.log('Sélecteur trouvé, clic en cours...');
        await page.click('#mat-option-137 > span');
        console.log('Clic réussi.');
        await delay(3000);

        // Étape 13 : Cliquer sur rechercher
        await page.evaluate(() => {
            const button = document.querySelector("#recherche-btn-rechercher > span.mat-button-wrapper");
            if (button) {
                button.click();
            } else {
                throw new Error('Bouton "Rechercher" non trouvé');
            }
        });

        console.log('Étape 13 : Recherche lancée !');
        await delay(3000)

        await page.waitForSelector('#resultat-txt-colis-trouves', { visible: true, timeout: 60000 });
        await page.click('#resultat-txt-colis-trouves');
        await delay(3000);

        console.log('Étape suivante 14 : selection la reclamation en cours');
        await page.waitForSelector('#resultat-row-colis-CA586964263FR-241007043722 > td.mat-cell.cdk-cell.cdk-column-parcelReference.mat-column-parcelReference.ng-star-inserted', { visible: true, timeout: 60000 });
        console.log('Sélecteur trouvé, clic en cours...');
        await page.click('#resultat-row-colis-CA586964263FR-241007043722 > td.mat-cell.cdk-cell.cdk-column-parcelReference.mat-column-parcelReference.ng-star-inserted');
        console.log('Clic réussi.');
        await delay(3000);

        console.log('Étape suivante 15 : selection commentaire');
        await page.waitForSelector('#service-details-icn-ajouter-commentaire > span.mat-button-wrapper > mat-icon', { visible: true, timeout: 60000 });
        console.log('Sélecteur trouvé, clic en cours...');
        await page.click('#service-details-icn-ajouter-commentaire > span.mat-button-wrapper > mat-icon');
        console.log('Clic réussi.');
        await delay(3000);

        console.log('Étape suivante 16 : Accès au champ de texte pour insérer le commentaire.');
        await page.waitForSelector('#mat-dialog-0 > app-update-dialog > div.content > mat-form-field > div > div.mat-form-field-flex.ng-tns-c125-91 textarea', { visible: true, timeout: 60000 });
        console.log('Sélecteur du champ de texte trouvé, insertion du commentaire en cours...');
        await page.type('#mat-dialog-0 > app-update-dialog > div.content > mat-form-field > div > div.mat-form-field-flex.ng-tns-c125-91 textarea', inProgressClaims[0].Comment);
        console.log(`Commentaire ajouté avec succès : ${inProgressClaims[0].Comment}`);
        await delay(1000);

        console.log('Étape suivante 17 : Soumission du commentaire.');
        await page.waitForSelector('#mat-dialog-0 > app-update-dialog > div.content > div.popup-footer > button:nth-child(2) > span.mat-button-wrapper', { visible: true, timeout: 60000 });
        console.log('Sélecteur du bouton "Envoyer" trouvé, clic en cours...');
        await page.click('#mat-dialog-0 > app-update-dialog > div.content > div.popup-footer > button:nth-child(2) > span.mat-button-wrapper');
        console.log('Clic sur le bouton "Envoyer" réussi, commentaire soumis avec succès.');
        await delay(3000);

        await delay(60000);
    } catch (error) {
        console.error(`Erreur lors de la tentative de connexion:`, error);
        throw error;
    } finally {
        if (browser) {
            console.log('Fermeture du navigateur...');
            await browser.close();
            console.log('Navigateur fermé.');
        }
    }
}

module.exports = loginAndNavigateToClaims;
