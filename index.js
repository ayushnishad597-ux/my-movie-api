const express = require('express');
const cors = require('cors');
const { MOVIES } = require('@consumet/api');

const app = express();
const flixhq = new MOVIES.FlixHQ();

app.use(cors());

app.get('/', (req, res) => {
    res.send('PIKAFLIX SERVER IS RUNNING 🚀');
});

// Ye hai wo MAGIC API jo tumhare app ke liye link dhundega
app.get('/stream', async (req, res) => {
    try {
        const query = req.query.name; // App movie ka naam bhejega
        if (!query) return res.status(400).json({ error: "Name required" });

        // 1. Search Movie
        const search = await flixhq.search(query);
        if (!search.results.length) return res.status(404).json({ error: "Not found" });

        const movie = search.results[0]; // Sabse pehla result lo

        // 2. Get Episode/Movie ID
        const info = await flixhq.fetchMediaInfo(movie.id);
        const episodeId = info.episodes[0].id; // Movies me ek hi episode hota hai

        // 3. Get Direct Video Link
        const sources = await flixhq.fetchEpisodeSources(episodeId, movie.id);
        
        // 4. Filter Best Quality (m3u8)
        const bestSource = sources.sources.find(s => s.quality === 'auto') || sources.sources[0];

        // App ko sirf Link wapas karo
        res.json({ 
            title: movie.title,
            streamUrl: bestSource.url,
            isM3U8: bestSource.isM3U8
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error. Try Again." });
    }
});

module.exports = app;
