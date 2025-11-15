import winston from 'winston';

const createLogger = (serviceName) => {
    return winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(
            winston.format.label({ label: serviceName }),
            winston.format.timestamp(
                { format: 'YYYY-MM-DD HH:mm:ss' }
            ),
            winston.format.errors({ stack: true }),
            winston.format.splat(),
            winston.format.json()
        ),
        defaultMeta: { service: serviceName },
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({ 
                filename: 'logs/error.log',
                level: 'error' , 
                maxsize: 5242880, 
                maxFiles: 5
            }),
            new winston.transports.File({ 
                filename: 'logs/combined.log',
                maxsize: 5242880,
                maxFiles: 5
            }),
        ],
    })
}

export default createLogger;