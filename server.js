const express = require('express');
const { Pool } = require('pg'); 
const app = express();

// Railway PostgreSQL සඳහා connection එක
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.use(express.json());
app.use(express.static('public'));

// Database සම්බන්ධතාවය පරීක්ෂා කිරීම
pool.connect()
    .then(() => console.log('============= DATABASE CONNECTED SUCCESSFULLY ============='))
    .catch(err => console.error('DATABASE CONNECTION FAILED: ', err.message));

// Login API (Postgres සඳහා)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM Users WHERE username = $1 AND password = $2', [username, password]);
        if (result.rows.length > 0) res.send({ success: true });
        else res.status(401).send({ success: false });
    } catch (err) { res.status(500).send(err.message); }
});

// Server එක පටන් ගැනීම
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`UN BIKE MART Server running on port ${PORT}`));
