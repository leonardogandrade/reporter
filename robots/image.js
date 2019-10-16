const state = require('./state.js');
const google = require('googleapis').google;
const customSearch = google.customsearch('v1');
const googleSearchCredentials = require('../credentials/google-search.json');

async function robot(){
    const content = state.load();

    await fetchImagesOfAllSentences(content);

    state.save(content);

    async function fetchImagesOfAllSentences(content){
        for(const sentence of content.sentences){
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.images = await fetchAndReturnImageLinks(query);

            sentence.googleSearchQuery = query;
        }
    }
    

    async function fetchAndReturnImageLinks(query){
        const response = await customSearch.cse.list({
            auth : googleSearchCredentials.apiKey,
            cx : googleSearchCredentials.searchEngineID,
            searchType : "image",
            q : query,
            num : 2
        });
        const imageUrl = response.data.items.map((item) => {
            return item.link;
        });
        return imageUrl;
    }
}

module.exports = robot