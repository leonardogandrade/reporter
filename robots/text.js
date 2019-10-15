const algorithmia = require('algorithmia');
const algorithmiaKey = require('../credentials/algorithmia.json').apiKey;
const sbd = require('sbd');


async function robot(content){
    await fetchContenFromWikipedia(content);
    sanitizeContent(content);
    breakContentIntoSentences(content);

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
                keys : [],
                iamges : [],
            })
        })
   }

}

module.exports = robot