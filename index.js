const express = require('express');
const cors = require('cors');
const { MOVIES } = require('@consumet/api');

const app = express();
const flixhq = new MOVIES.FlixHQ(); 

app.use(cors());

// 1. Home Route (Check karne ke liye)
app.get('/', (req, res) => {
    res.send('✅ Private Server is Working!');
});

// 2. Search API
app.get('/search/:query', async (req, res) => {
    try {
        const query = req.params.query;
        const results = await flixhq.search(query);
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: "Search failed" });
    }
});

// 3. Info API (Episode ID lene ke liye)
app.get('/info/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const info = await flixhq.fetchMediaInfo(id);
        res.status(200).json(info);
    } catch (err) {
        res.status(500).json({ error: "Info failed" });
    }
});

// 4. Stream API (Main Video Link)
app.get('/watch/:episodeId/:mediaId', async (req, res) => {
    try {
        const { episodeId, mediaId } = req.params;
        const data = await flixhq.fetchEpisodeSources(episodeId, mediaId);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: "Stream extraction failed" });
    }
});

// IMPORTANT FIX: Listen hata diya, Export laga diya
module.exports = app;
