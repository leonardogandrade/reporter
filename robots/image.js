const state = require('./state.js');
const google = require('googleapis').google;
const customSearch = google.customsearch('v1');
const googleSearchCredentials = require('../credentials/google-search.json');
const imageDonwloader = require('image-downloader');

async function robot(){
    const content = state.load();

    //await fetchImagesOfAllSentences(content);
    await downloadAllImages(content);
    //state.save(content);

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

    async function downloadAllImages(content){
        content.downloadedImages = [];

        for(let sentenceIndex =0; sentenceIndex < content.sentences.length; sentenceIndex++){
            const images = content.sentences[sentenceIndex].images;
            
            for(let imageIndex =0; imageIndex < images.length; imageIndex++){
                const imageUrl = images[imageIndex];
                
                try{
                    if(content.downloadedImages.includes(imageUrl)){
                        throw new Error('imagem já foi baixada');
                    }
                    
                    await downloadAndSave(imageUrl,`${sentenceIndex}-original.png`)

                    content.downloadedImages.push(imageUrl);
                    console.log(`> [${sentenceIndex}][${imageIndex}]  baixou imagem com sucesso. ${imageUrl}`);
                    break;
                }catch(error){
                    console.log(`> [${sentenceIndex}][${imageIndex}] Erro ao baixar ${imageUrl} : ${error}`);
                }
            }
        }
    }

    async function downloadAndSave(url,filename){
        return imageDonwloader.image({
            url, url,
            dest : `./content/${filename}`
        })
    }

}

module.exports = robot