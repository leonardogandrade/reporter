const readline = require('readline-sync');
const state = require('../robots/state.js');

function robot(){

    const content = {
        maximumSentences : 7
    }
    
    content.searchTerm = askAndReturnSearchTerm();
    content.prefix = askAndReturnPrefix();
    state.save(content);
    
    function askAndReturnSearchTerm(){
        return readline.question('Type a wikipedia term:');
    }
    
    function askAndReturnPrefix(){
        const prefixes = ['Who is','What is','The History of'];
        const selectedPrefixIndex = readline.keyInSelect(prefixes,'Choose one:');
        const selectedPrefixText = prefixes[selectedPrefixIndex];
        return selectedPrefixText;
    }
}

module.exports = robot