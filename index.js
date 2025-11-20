const express = require('express');
const cors = require('cors');
// Sahi library import kar rahe hain
const { MOVIES } = require('@consumet/api');

const app = express();
// FlixHQ provider (Best for Movies)
const flixhq = new MOVIES.FlixHQ(); 

app.use(cors());

app.get('/', (req, res) => {
    res.send('PIKAFLIX SERVER IS LIVE! 🟢');
});

app.get('/stream', async (req, res) => {
    try {
        const name = req.query.name; 
        if (!name) return res.status(400).json({ error: "Name required" });

        // 1. Movie Search
        const search = await flixhq.search(name);
        if (!search.results || search.results.length === 0) {
            return res.status(404).json({ error: "Not found" });
        }

        const movie = search.results[0];

        // 2. Info & Episode ID
        const info = await flixhq.fetchMediaInfo(movie.id);
        // Movies usually have 1 episode, grab the first one
        const episodeId = info.episodes[0].id; 

        // 3. Get Stream Link
        const streamData = await flixhq.fetchEpisodeSources(episodeId, movie.id);
        
        // 4. Best Quality Link
        // Auto ya 1080p dhundo, nahi to pehla wala de do
        const bestStream = streamData.sources.find(s => s.quality === 'auto') || streamData.sources[0];

        res.status(200).json({ 
            url: bestStream.url,
            title: movie.title,
            isM3U8: bestStream.isM3U8
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server processing error" });
    }
});

module.exports = app;
