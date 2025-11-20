const express = require('express');
const cors = require('cors');
// Standard Library Import
const { MOVIES } = require('@consumet/api');

const app = express();
const port = process.env.PORT || 3000;

// FlixHQ Provider
const flixhq = new MOVIES.FlixHQ(); 

app.use(cors());

app.get('/', (req, res) => {
    res.send('SERVER IS ON! 🟢');
});

app.get('/stream', async (req, res) => {
    try {
        const name = req.query.name; 
        if (!name) return res.status(400).json({ error: "Name required" });

        console.log("Searching:", name);

        // 1. Search
        const search = await flixhq.search(name);
        if (!search.results.length) return res.status(404).json({ error: "Not found" });

        const movie = search.results[0];

        // 2. Get Episode ID
        const info = await flixhq.fetchMediaInfo(movie.id);
        if (!info.episodes || info.episodes.length === 0) {
             return res.status(404).json({ error: "No episodes found" });
        }
        
        const episodeId = info.episodes[0].id; 

        // 3. Get Stream
        const streamData = await flixhq.fetchEpisodeSources(episodeId, movie.id);
        
        // 4. Best Quality
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

app.listen(port, () => {
    console.log(`Running on ${port}`);
});
