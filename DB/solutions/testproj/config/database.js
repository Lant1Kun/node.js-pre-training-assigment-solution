require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '..', '.env');
const result = dotenv.config({ path: envPath });

const seqelize = new Sequelize (
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host : process.env.DB_HOST,
        port : process.env.DB_PORT,
        dialect : process.env.DB_DIALECT,
        logging : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = seqelize;