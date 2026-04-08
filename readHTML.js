
var fs = require('fs');
function readHTML(htmlfile)
{
    var htmltext ="";
    try
    {
        htmltext = fs.readFileSync(htmlfile);
    }
    catch (err)
    {
        console.error(err);
    }
    return htmltext;
}

module.exports = readHTML;