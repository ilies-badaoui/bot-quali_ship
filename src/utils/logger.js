const winston = require('winston');

// Configuration du logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
    ),
    transports: [
        // Écriture dans les fichiers
        new winston.transports.File({ filename: 'error.log', level: 'error' }), // Fichier pour les erreurs uniquement
        new winston.transports.File({ filename: 'combined.log' }) // Fichier pour tous les logs
    ]
});

// Ajout de la console uniquement en mode développement
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

module.exports = logger;
