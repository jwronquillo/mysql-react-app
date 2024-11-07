const db = require('../db/db.js');

const fetchRelatedData = async (personId) => {
    const relatedData = {
        addresses: [],
        phones: [],
        emails: [],
        identifiers: [],
        aliases: [],
        sanctions: [],
        countries: []
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

const exactSearch = async (name) => {
    const names = name.trim().split(" ");
    const firstName = names[0];
    const lastName = names.length > 1 ? names[1] : '';

    const query = `SELECT * FROM person WHERE name LIKE ? AND name LIKE ?`;
    const [results] = await db.promise().query(query, [`%${firstName}%`, `%${lastName}%`]);

    return Promise.all(results.map(async (person) => {
        const relatedData = await fetchRelatedData(person.id);
        return { ...person, ...relatedData };
    }));
};

const possibleSearch = async (firstName, lastName, exactMatches = [] ) => {
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
    if (exactMatches.length > 0) {
    const exactMatchConditions = exactMatches.map(() => `AND name != ?`).join(' ');
    conditionsExact.push(`${exactMatchConditions}`);
    queryParams.push(...exactMatches);
    }
    
    const finalQuery = `SELECT * FROM person WHERE (${conditions.join(' OR ')}) ${conditionsExact.join(' ')}`;
    const [possibleResults] = await db.promise().query(finalQuery, queryParams);

    return Promise.all(possibleResults.map(async (person) => {
        const relatedData = await fetchRelatedData(person.id);
        return { ...person, ...relatedData };
    }));
};

module.exports = { fetchRelatedData, exactSearch, possibleSearch };