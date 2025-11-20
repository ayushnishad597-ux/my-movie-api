const express = require('express');
const cors = require('cors');
const { MOVIES } = require('@consumet/api');

const app = express();
const flixhq = new MOVIES.FlixHQ(); // Ye provider best hai movies ke liye

app.use(cors());

app.get('/', (req, res) => {
    res.send('PIKAFLIX SERVER IS ACTIVE! 🟢');
});

// MAGIC API: Ye naam lega aur Direct Video Link dega
app.get('/stream', async (req, res) => {
    try {
        const name = req.query.name; 
        if (!name) return res.status(400).json({ error: "Naam bhejo bhai" });

        // 1. Movie Search karo
        const search = await flixhq.search(name);
        if (search.results.length === 0) return res.status(404).json({ error: "Movie nahi mili" });

        const movie = search.results[0]; // Pehla result uthao

        // 2. Info nikalo (Episode ID chahiye hoti hai)
        const info = await flixhq.fetchMediaInfo(movie.id);
        const episodeId = info.episodes[0].id; 

        // 3. Direct Video Link nikalo
        const streamData = await flixhq.fetchEpisodeSources(episodeId, movie.id);
        
        // 4. Best Quality Link filter karo
        const bestStream = streamData.sources.find(s => s.quality === 'auto') || streamData.sources[0];

        // Link bhej do
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
