const express = require('express');
const cors = require('cors');
// Working Library Import
const { MOVIES } = require('@consumet/api');

const app = express();
const port = process.env.PORT || 3000;

// FlixHQ Provider Setup
const flixhq = new MOVIES.FlixHQ(); 

app.use(cors());

// Home Page Check
app.get('/', (req, res) => {
    res.send('PIKAFLIX PRIVATE SERVER IS READY! ✅');
});

// Streaming API
app.get('/stream', async (req, res) => {
    try {
        const name = req.query.name; 
        if (!name) return res.status(400).json({ error: "Naam bhejo" });

        console.log("Searching for:", name);

        // 1. Movie Search
        const search = await flixhq.search(name);
        if (!search.results || search.results.length === 0) {
            return res.status(404).json({ error: "Movie nahi mili" });
        }

        const movie = search.results[0];

        // 2. Info & Episode ID
        const info = await flixhq.fetchMediaInfo(movie.id);
        
        // Movie hai to pehla episode, nahi to error avoid karo
        if (!info.episodes || info.episodes.length === 0) {
             return res.status(404).json({ error: "Episodes nahi mile" });
        }
        
        const episodeId = info.episodes[0].id; 

        // 3. Direct Link Extraction
        const streamData = await flixhq.fetchEpisodeSources(episodeId, movie.id);
        
        // 4. Best Quality (Auto ya 1080p)
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

// Server Start
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
