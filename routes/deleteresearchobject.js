const express = require('express');
const router = express.Router();

var cookieParser = require('cookie-parser');
router.use(cookieParser());

const readHTML = require('../readHTML.js');
var fs = require('fs');
const path = require('path');

const pug = require('pug');
const { response } = require('express');
const pug_loggedinmenu = pug.compileFile('./master-frame/loggedinmenu.html');

const canEdit = (request) => {
    if (!request.session.loggedin) return false;
    const level = request.session.securityaccesslevel;
    return ['A', 'B'].includes(level);
};

router.use(express.static('./public'));

var htmlHead = readHTML('./master-frame/head.html');
var htmlHeader = readHTML('./master-frame/header.html');
var htmlMenu = readHTML('./master-frame/menu.html');
var htmlInfoStart = readHTML('./master-frame/infostart.html');
var htmlInfoStop = readHTML('./master-frame/infostop.html');
var htmlBottom = readHTML('./master-frame/bottom.html');

// Default-router, if no other button was pressed
router.get('/:id', (request, response) =>
{
    // takes in params
    const id = request.params.id;

    //opens database
    const ADODB = require('node-adodb');
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb');

    async function sqlQuery()
    {
    response.write(htmlHead);
    response.write(htmlHeader);
    if(request.session.loggedin==true){var htmlLoggedInMenuCSS = readHTML('./master-frame/loggedinmenu_css.html');response.write(htmlLoggedInMenuCSS);}
    if(request.session.loggedin==true){var htmlLoggedInMenuJS = readHTML('./master-frame/loggedinmenu_js.html');response.write(htmlLoggedInMenuJS);}
    //if(request.session.loggedin==true){var htmlLoggedInMenu = readHTML('./master-frame/loggedinmenu.html');response.write(htmlLoggedInMenu);}
    if(request.session.loggedin)
    {
        response.write(pug_loggedinmenu({
            employeecode : request.cookies.employeecode,
            name : request.cookies.name,
            logintimes : request.cookies.logintimes,
            lastlogin : request.cookies.lastlogin
        }));
    }
    response.write(htmlMenu);
    response.write(htmlInfoStart);
        if(canEdit(request))  // check permissions
        {
            const result = await connection.query("SELECT objectNumber FROM ResearchObjects WHERE ID=" + id);

            if(result.length > 0)
            {
                const objectNumber = result[0]['objectNumber'];

                // delete PDF
                const pdfFolder = './data/safetydatasheets/';
                const files = fs.readdirSync(pdfFolder);
                files.forEach(file => {
                    if(file === objectNumber + '.pdf')
                    {
                        fs.unlinkSync(pdfFolder + file);
                    }
                });

                // detele images
                var imagePath = './public/virusphoto/${id}';
                if(fs.existsSync(imagePath))
                {
                    fs.rmdirSync(imagePath, { recursive: true });
                }

                // delete record 
                const deleteResult = await connection.execute("DELETE FROM ResearchObjects WHERE id=" + id);
                response.write("Research object deleted.<br />");
                response.write("<a href=\"http://localhost:3000/api/virusdatabase\" style=\"color:#336699;\">Back to Research Database</a>");
            }
            else
            {
                response.write("Object not found.");
            }
        }
        else
        {
            response.write("You are not authorised to do this.");
        }

        response.write(htmlInfoStop);
        response.write(htmlBottom);
        response.end();
    }
    sqlQuery();
});

module.exports = router;