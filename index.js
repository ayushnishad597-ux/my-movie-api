const express = require('express');
const cors = require('cors');
// Nayi Library (Jo delete nahi hui hai)
const { MOVIES } = require('consumet.js');

const app = express();
const port = process.env.PORT || 3000; // Render ke liye zaroori hai
const flixhq = new MOVIES.FlixHQ(); 

app.use(cors());

app.get('/', (req, res) => {
    res.send('PIKAFLIX SERVER IS LIVE ON RENDER! 🚀');
});

app.get('/stream', async (req, res) => {
    try {
        const name = req.query.name; 
        if (!name) return res.status(400).json({ error: "Naam bhejo bhai" });

        // 1. Search
        const search = await flixhq.search(name);
        if (!search.results || search.results.length === 0) {
            return res.status(404).json({ error: "Movie nahi mili" });
        }

        const movie = search.results[0];

        // 2. Info
        const info = await flixhq.fetchMediaInfo(movie.id);
        const episodeId = info.episodes[0].id; 

        // 3. Stream Link
        const streamData = await flixhq.fetchEpisodeSources(episodeId, movie.id);
        
        // 4. Best Quality Link
        const bestStream = streamData.sources.find(s => s.quality === 'auto') || streamData.sources[0];

        res.status(200).json({ 
            url: bestStream.url,
            title: movie.title
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Server Start Karo
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
