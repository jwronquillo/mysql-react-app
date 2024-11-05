const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'pawnheroadmin',
    database: 'sanctionsdb'
});

app.get('/search/exact', (req, res) => {
    const { name } = req.query;

    if (!name || !name.trim()) {
        return res.status(400).json({ error: "Please provide a name for exact match." });
    }

    const names = name.trim().split(" ");
    const firstName = names[0];
    const lastName = names.length > 1 ? names[1] : '';

    const query = `SELECT * FROM individual WHERE name LIKE ? AND name LIKE ?`;
    db.query(query, [`%${firstName}%`, `%${lastName}%`], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ exactMatches: results });
    });
});

app.get('/search/possible', (req, res) => {
    const { firstName, lastName, exactMatches } = req.query;

    const queryParams = [];
    let conditions = [];
    let conditionsExact = [];

    if (firstName && firstName.trim()) {
        conditions.push(`name LIKE ?`);
        queryParams.push(`%${firstName.trim()}%`);
    }
    if (lastName && lastName.trim()) {
        conditions.push(`name LIKE ?`);
        queryParams.push(`%${lastName.trim()}%`);
    }
        if (exactMatches && exactMatches.length > 0) {
        const exactMatchConditions = exactMatches.map(() => `AND name != ?`).join(' AND ');
        conditionsExact.push(`${exactMatchConditions}`);
        queryParams.push(...exactMatches);
    }

    if (conditions.length === 0) {
        return res.status(400).json({ error: "Please provide at least one search term." });
    }

    const query = `SELECT * FROM individual WHERE (${conditions.join(' OR ')}) ${conditionsExact}`;


    console.log("Exact Matches to Exclude:", exactMatches);
    console.log("SQL Query:", query);
    console.log("Query Params:", queryParams);
    
    db.query(query, queryParams, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ possibleMatches: results });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});