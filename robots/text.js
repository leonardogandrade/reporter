const algorithmia = require('algorithmia');
const algorithmiaKey = require('../credentials/algorithmia.json').apiKey;
const sbd = require('sbd');
const watsonApiKey = require('../credentials/watson-nlu.json').apikey;
const state = require('../robots/state.js');

const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

const nlu = new NaturalLanguageUnderstandingV1({
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api',
    version: '2019-02-01',
    iam_apikey: watsonApiKey,
  });

async function robot(){
    const content = state.load();

    await fetchContenFromWikipedia(content);
    sanitizeContent(content);
    breakContentIntoSentences(content);
    limitMaximumSentences(content);
    await fetchKeyWordsOfAllSentences(content);

    state.save(content);

    async function fetchContenFromWikipedia(content){
        const algorithmiaAuthenticated =  algorithmia(algorithmiaKey);
        const wikipediaAlgorithm =  algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2');
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm);
        const wikipediaContent =  wikipediaResponse.get();
        content.sourceOriginalContent = wikipediaContent.content;
    }

   function sanitizeContent(content){
        const allLines = content.sourceOriginalContent.split('\n');
        const withoutBlankLinesAndMarkDown = removeBlankLinesAndMarkDown(allLines);
        const withoutDatesInParenthesis = removeDatesInParenthesis(withoutBlankLinesAndMarkDown);
        content.sourceContentSanitized = withoutDatesInParenthesis;

        function removeBlankLinesAndMarkDown(text){
            const withoutBlankLinesAndMarkDown = text.filter((lines) =>{
                if(lines.trim().length === 0 || lines.trim().startsWith('=')){
                    return false
                }
                    return true
            });
            return withoutBlankLinesAndMarkDown.join(' ');    
        }

        function removeDatesInParenthesis(text){
            return text.replace(/\([^)]*\)/gm,'').replace(/ /g,' ');
        }

   }

   function breakContentIntoSentences(content){
        content.sentences = []

        const sentences = sbd.sentences(content.sourceContentSanitized);
        sentences.forEach((sentence) => {
            content.sentences.push({
                text : sentence,
                keywords : [],
                iamges : [],
            })
        })
   }

   function limitMaximumSentences(content){
        content.sentences = content.sentences.slice(0,content.maximumSentences);
   }

   async function fetchKeyWordsOfAllSentences(content){
        for(const sentence of content.sentences){
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text);
        }
   }

    async function fetchWatsonAndReturnKeywords(sentence){
        return new Promise((resolve,reject) => {
            nlu.analyze({
                text: sentence, // Buffer or String
                features: {
                keywords: {}
                }
            },
            function(err, response) {
                if (err) {
                    throw err
                }
                const keywords = response.keywords.map((keywords) =>{
                    return keywords.text;
                })
                resolve(keywords);
            });
        })
    }


}

module.exports = robot