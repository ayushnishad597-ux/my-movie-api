const express = require('express');
const cors = require('cors');
const { MOVIES } = require('@consumet/api');

const app = express();
const port = process.env.PORT || 3000;
const flixhq = new MOVIES.FlixHQ(); 

app.use(cors());

app.get('/', (req, res) => {
    res.send('SERVER IS ON 🔥');
});

app.get('/stream', async (req, res) => {
    try {
        const name = req.query.name; 
        if (!name) return res.status(400).json({ error: "Name required" });

        const search = await flixhq.search(name);
        if (!search.results.length) return res.status(404).json({ error: "Not found" });

        const movie = search.results[0];
        const info = await flixhq.fetchMediaInfo(movie.id);
        const episodeId = info.episodes[0].id; 
        const streamData = await flixhq.fetchEpisodeSources(episodeId, movie.id);
        const bestStream = streamData.sources.find(s => s.quality === 'auto') || streamData.sources[0];

        res.status(200).json({ 
            url: bestStream.url,
            title: movie.title
        });

    } catch (err) {
        res.status(500).json({ error: "Error" });
    }
});

app.listen(port, () => console.log(`Running on ${port}`));
