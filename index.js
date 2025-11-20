const express = require('express');
const cors = require('cors');
const { MOVIES } = require('@consumet/api');

const app = express();
const flixhq = new MOVIES.FlixHQ(); // Ye provider movies dhundega

app.use(cors());

app.get('/', (req, res) => {
    res.send('Mera Private Server Chal Gaya! 🚀');
});

// 1. Movie Search Karne ke liye
app.get('/search/:query', async (req, res) => {
    try {
        const results = await flixhq.search(req.params.query);
        res.json(results);
    } catch (err) {
        res.status(500).send("Error searching");
    }
});

// 2. Movie ka Direct Link nikalne ke liye
app.get('/watch/:episodeId/:mediaId', async (req, res) => {
    try {
        const data = await flixhq.fetchEpisodeSources(req.params.episodeId, req.params.mediaId);
        res.json(data);
    } catch (err) {
        res.status(500).send("Error streaming");
    }
});

app.listen(3000, () => console.log("Server Ready"));
