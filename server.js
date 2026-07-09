const express = require('express');
const { Pool } = require('pg'); 
const app = express();

// Railway database connection eka
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.use(express.json());
app.use(express.static('public'));

// Database connection eka hariyatama wada karanawada kiyala check karanna
pool.connect()
    .then(() => console.log("Connected to Railway PostgreSQL!"))
    .catch(err => console.error("Database connection error:", err));

// Login eka
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM Users WHERE username = $1 AND password = $2', [username, password]);
        if (result.rows.length > 0) {
            res.send({ success: true });
        } else {
            res.status(401).send({ success: false });
        }
    } catch (err) { res.status(500).send(err.message); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Running on port ${PORT}`));
