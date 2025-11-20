const express = require('express');
const cors = require('cors');
const { MOVIES } = require('@consumet/api');

const app = express();
const flixhq = new MOVIES.FlixHQ();

app.use(cors());

app.get('/', (req, res) => {
    res.send('PIKA SERVER IS LIVE! 🔥');
});

app.get('/search/:query', async (req, res) => {
    try {
        const results = await flixhq.search(req.params.query);
        res.json(results);
    } catch (err) {
        res.status(500).send("Error searching");
    }
});

app.get('/watch/:episodeId/:mediaId', async (req, res) => {
    try {
        const data = await flixhq.fetchEpisodeSources(req.params.episodeId, req.params.mediaId);
        res.json(data);
    } catch (err) {
        res.status(500).send("Error streaming");
    }
});

// YAHAN CHANGE KIYA HAI:
// app.listen hata diya hai
module.exports = app;
