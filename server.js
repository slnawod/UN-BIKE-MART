const express = require('express');
const sql = require('mssql');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

// වැදගත්ම කොටස: Railway එකේ දෙන DATABASE_URL එක මෙයින් භාවිතා වේ
const dbConfig = process.env.DATABASE_URL;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));
app.use(express.static('public'));

// Database Connection
sql.connect(dbConfig).then(() => {
    console.log("Connected to Railway Database successfully!");
}).catch(err => {
    console.error("Database connection failed: ", err);
});

// Routes
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await sql.query(`SELECT * FROM Users WHERE Username = '${username}' AND Password = '${password}'`);
        if (result.recordset.length > 0) {
            req.session.user = username;
            res.send({ success: true });
        } else {
            res.status(401).send({ success: false });
        }
    } catch (err) { res.status(500).send(err.message); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
