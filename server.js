const express = require('express');
const mssql = require('mssql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname));

// ක්ලවුඩ් සර්වර් එකේදී DATABASE_URL භාවිතා කරන්න. නැත්නම් දේශීයව භාවිතා කරන්න.
const dbConfig = process.env.DATABASE_URL || {
    user: 'reliance', 
    password: 'relsoft', 
    server: '127.0.0.1',           
    port: 1433,                    
    database: 'UnBikeMart',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

let pool;

async function connectDatabase() {
    try {
        // DATABASE_URL ලබා දෙන්නේ නම් එය භාවිතා කරන්න, නැත්නම් dbConfig වස්තුව භාවිතා කරන්න
        pool = await mssql.connect(process.env.DATABASE_URL || dbConfig);
        console.log('============= DATABASE CONNECTED SUCCESSFULLY =============');
    } catch (err) {
        console.error('DATABASE CONNECTION FAILED: ', err.message);
    }
}

connectDatabase();

// --- API ROUTES (පෙර පරිදිම තබා ගන්න) ---
// (උදාහරණයක් ලෙස Vehicles API)
app.get('/api/vehicles', async (req, res) => {
    try {
        let result = await pool.request().query("SELECT * FROM Vehicles");
        res.json(result.recordset);
    } catch (err) { 
        console.error("Fetch Vehicles Error: ", err.message);
        res.status(500).send(err.message); 
    }
});

// Port එක සඳහා process.env.PORT භාවිතා කරන්න
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`UN BIKE MART Server running on port ${PORT}`));
