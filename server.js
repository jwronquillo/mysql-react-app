const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost', // Your database host
    user: 'root', // Your database user
    password: 'pawnheroadmin', // Your database password
    database: 'sanctionsdb' // Your database name
});

// Connect to the database
db.connect(err => {
    if (err) throw err;
    console.log('Connected to the database.');
});

// Helper function to fetch related data
const fetchRelatedData = async (personId) => {
    const relatedData = {
        addresses: [],
        phones: [],
        emails: [],
        identifiers: [],
        aliases: [],
        sanctions: []
        // countries: []
    };

    // Fetch addresses
    const [addresses] = await db.promise().query(`SELECT address FROM addresses WHERE person_id = ?`, [personId]);
    relatedData.addresses = addresses.map(row => row.address).join('; ');

    // Fetch phones
    const [phones] = await db.promise().query(`SELECT phone FROM phones WHERE person_id = ?`, [personId]);
    relatedData.phones = phones.map(row => row.phone).join('; ');

    // Fetch emails
    const [emails] = await db.promise().query(`SELECT email FROM emails WHERE person_id = ?`, [personId]);
    relatedData.emails = emails.map(row => row.email).join('; ');

    // Fetch identifiers
    const [identifiers] = await db.promise().query(`SELECT identifier FROM identifiers WHERE person_id = ?`, [personId]);
    relatedData.identifiers = identifiers.map(row => row.identifier).join('; ');

    // Fetch aliases
    const [aliases] = await db.promise().query(`SELECT alias FROM aliases WHERE person_id = ?`, [personId]);
    relatedData.aliases = aliases.map(row => row.alias).join('; ');

    // Fetch sanctions
    const [sanctions] = await db.promise().query(`SELECT sanction FROM sanctions WHERE person_id = ?`, [personId]);
    relatedData.sanctions = sanctions.map(row => row.sanction).join('; ');

    // Fetch countries
    const [countries] = await db.promise().query(`SELECT country FROM countries WHERE person_id = ?`, [personId]);
    relatedData.countries = countries.map(row => row.country).join('; ');

    return relatedData;
};

// Fetch exact matches
app.get('/search/exact', async (req, res) => {
    const { name } = req.query;

    if (!name || !name.trim()) {
        return res.status(400).json({ error: "Please provide a name for exact match." });
    }

    const names = name.trim().split(" ");
    const firstName = names[0];
    const lastName = names.length > 1 ? names[1] : '';

    const query = `SELECT * FROM person WHERE name LIKE ? AND name LIKE ?`;
    db.query(query, [`%${firstName}%`, `%${lastName}%`], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const enrichedResults = await Promise.all(results.map(async (person) => {
            const relatedData = await fetchRelatedData(person.id);
            return { ...person, ...relatedData };
        }));

        res.json({ exactMatches: enrichedResults });
    });
});

// Fetch possible matches
app.get('/search/possible', async (req, res) => {
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

    const finalQuery = `SELECT * FROM individual WHERE (${conditions.join(' OR ')}) ${conditionsExact}`;
    db.query(finalQuery, queryParams, async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const enrichedResults = await Promise.all(results.map(async (person) => {
            const relatedData = await fetchRelatedData(person.id);
            return { ...person, ...relatedData };
        }));

        res.json({ possibleMatches: enrichedResults });
    });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});