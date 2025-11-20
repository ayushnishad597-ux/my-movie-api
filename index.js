const express = require('express');
const cors = require('cors');
// Nayi Library Import kar rahe hain
const { MOVIES } = require('consumet.js');

const app = express();
// FlixHQ provider initialize kar rahe hain
const flixhq = new MOVIES.FlixHQ(); 

app.use(cors());

app.get('/', (req, res) => {
    res.send('PIKAFLIX SERVER IS LIVE & FIXED! 🔥');
});

app.get('/stream', async (req, res) => {
    try {
        const name = req.query.name; 
        if (!name) return res.status(400).json({ error: "Naam bhejo bhai" });

        // 1. Search
        const search = await flixhq.search(name);
        if (search.results.length === 0) return res.status(404).json({ error: "Movie nahi mili" });

        const movie = search.results[0];

        // 2. Info
        const info = await flixhq.fetchMediaInfo(movie.id);
        const episodeId = info.episodes[0].id; 

        // 3. Stream Link
        const streamData = await flixhq.fetchEpisodeSources(episodeId, movie.id);
        
        // 4. Best Quality
        const bestStream = streamData.sources.find(s => s.quality === 'auto') || streamData.sources[0];

        res.status(200).json({ 
            url: bestStream.url,
            title: movie.title
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error, try again." });
    }
});

module.exports = app;
