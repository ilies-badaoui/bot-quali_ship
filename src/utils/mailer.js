const nodemailer = require('nodemailer');

async function sendErrorEmail(error) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'badaoui.iliess@gmail.com',
            pass: 'lifaotsebntntkgf' // Remplace par le mot de passe d'application généré depuis ton compte Google
        }
    });

    let mailOptions = {
        from: 'badaoui.iliess@gmail.com',
        to: 'badaoui.iliess@gmail.com',
        subject: 'Erreur dans le bot Colissimo',
        text: `Le bot a rencontré une erreur : ${error.message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email envoyé au développeur avec succès.');
    } catch (err) {
        console.error('Erreur lors de l\'envoi de l\'email :', err);
    }
}

module.exports = { sendErrorEmail };
