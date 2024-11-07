const express = require('express');
const router = express.Router();
const { exactSearch, possibleSearch } = require ('../Functions/SearchFunction');

router.get('/exact', async (req, res) => {
    const { name } = req.query;
    if (!name || !name.trim()) {
        return res.status(400).json ({ message: 'Name is required' });
    }
    try {
        const results = await exactSearch(name);
        res.json({ exactMatches: results });
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
});

router.get('/possible', async (req, res) => {
    const { firstName, lastName, exactMatches } = req.query;
    try{
        const results =  await possibleSearch(firstName, lastName, exactMatches);
        res.json({ possibleMatches: results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

module.exports = router;