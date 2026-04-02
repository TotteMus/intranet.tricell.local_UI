const express = require('express');
const router = express.Router();

var cookieParser = require('cookie-parser');
router.use(cookieParser());
router.use(express.urlencoded({ extended: true }));

const readHTML = require('../readHTML.js');
var fs = require('fs');
const path = require('path');

const pug = require('pug');
const { response } = require('express');
const backupVirus = require('../backup.js');
const pug_loggedinmenu = pug.compileFile('./master-frame/loggedinmenu.html');
const pug_editresearchobject = pug.compileFile('./master-frame/editresearchobject.html');

router.use(express.static('./public'));
const { getVirusImagesHTML } = require('./virusimages.js')

const canEdit = (request) => {
    if (!request.session.loggedin) return false;
    const level = request.session.securityaccesslevel;
    return ['A', 'B'].includes(level);
};

var htmlHead = readHTML('./master-frame/head.html');
var htmlHeader = readHTML('./master-frame/header.html');
var htmlMenu = readHTML('./master-frame/menu.html');
var htmlInfoStart = readHTML('./master-frame/infostart.html');
var htmlInfoStop = readHTML('./master-frame/infostop.html');
var htmlBottom = readHTML('./master-frame/bottom.html');
var htmlVirusimagesCSS = readHTML('./master-frame/virusimages_CSS.html')

// form to edit objects
router.get('/:id', function(request, response) 
{
    // recive in params
    var id = request.params.id;

        //opens database
    const ADODB = require('node-adodb');
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb');


    async function sqlQuery()
    {
    const result = await connection.query("SELECT * FROM ResearchObjects WHERE id="+id+"");

    //read variables
        str_id = result[0]['ID'];
        str_objectNumber = result[0]['objectNumber'];
        str_objectName = result[0]['objectName'];
        str_objectCreator = result[0]['objectCreator'];
        str_objectCreatedDate = result[0]['objectCreatedDate'];
        str_objectCreatedTime = result[0]['objectCreatedTime'];
        str_objectText = result[0]['objectText'];
        str_objectStatus = result[0]['objectStatus'];
        str_presentationVideoLink = result[0]['presentationVideoLink'];
        str_securityVideoLink = result[0]['securityVideoLink'];

    
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

    if(canEdit(request))
    {
        var newresearchobjectCSS = readHTML('./master-frame/newemployee_css.html');
        response.write(newresearchobjectCSS);
        var newresearchobjecteJS = readHTML('./master-frame/newresearchobject_js.html');
        response.write(newresearchobjecteJS);
        response.write(htmlVirusimagesCSS);
        var newresearchobjecteJS = readHTML('./master-frame/newresearchobject.html');


        let editOutput = pug_editresearchobject({
            id: id,
            objectNumber: str_objectNumber,
            objectName:     str_objectName,
            objectCreator: str_objectCreator,
            objectCreatedDate: str_objectCreatedDate,
            objectCreatedTime: str_objectCreatedTime,
            objectText: str_objectText,
            objectStatus: str_objectStatus,
            presentationVideoLink: str_presentationVideoLink,
            securityVideoLink: str_securityVideoLink,
        });
        editOutput += `<a href="http://localhost:3000/api/editresearchobject/backup/${id}" style="color:#336699;text-decoration:none;"> 
                <button style="margin-top:10px; padding:6px 14px; background:#4682B4;color:#000000; border:1px solid #000; border-radius:0; font-size:12px; font-weight:bold; cursor:pointer;">
                    Backup virus
                </button></a>`

        response.write(editOutput);
        response.write(getVirusImagesHTML(id));
    }
    else
    {
        response.write("You are not logged in")
    }
    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();

    }
    sqlQuery();

});
// router for updating database
router.post('/:id', (request, response) =>
{

    // recive in params
    const id = request.params.id;

    // recives form data to variables
    const objectNumber = request.body.fobjectNumber;
    const objectName = request.body.fobjectName;
    const objectCreator = request.body.fobjectCreator;
    
    const formatDate = (d) => {
        if (!d) return 'NULL';
        const [y, m, day] = d.split('-');
        return `#${m}/${day}/${y}#`;
    };
    const objectCreatedDate = formatDate(request.body.fobjectCreatedDate);

    const objectCreatedTime = request.body.fobjectCreatedTime;
    const objectText = request.body.fobjectText;
    const objectStatus = request.body.fobjectStatus;
    const presentationVideoLink = request.body.fpresentationVideoLink;
    const securityVideoLink = request.body.fsecurityVideoLink;


    //opens database
    const ADODB = require('node-adodb');
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb');

    async function sqlQuery()
    {

    response.write(htmlHead);
    
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
    response.write(htmlHeader);
    response.write(htmlMenu);
    response.write(htmlInfoStart);
    if(canEdit(request))
    {   
	    const result = await connection.execute(
        "UPDATE ResearchObjects SET " +
        "objectNumber='" + objectNumber + "'," +
        "objectName='" + objectName + "'," +
        "objectText='" + objectText + "'," +
        "objectStatus='" + objectStatus + "'," +
        "presentationVideoLink='" + presentationVideoLink + "'," +
        "securityVideoLink='" + securityVideoLink + "'" +
        "WHERE id=" + id
        );
        response.write("ResearchObject edited! <br />");
        response.write("<a href=\"http://localhost:3000/api/virusdatabase\" style=\"color:#336699;\">Edit Another Research Object</a>");
    }
    else
    {
        response.write("You are not logged in")
    }

    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();

    }
    sqlQuery();
});

router.get('/backup/:id', function(request, response) 
{
    // recive in params
    var id = request.params.id;

        //opens database
    const ADODB = require('node-adodb');
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb');


    async function sqlQuery()
    {
    const result = await connection.query("SELECT * FROM ResearchObjects WHERE id="+id+"");

    //read variables
        str_id = result[0]['ID'];
        str_objectNumber = result[0]['objectNumber'];
        str_objectName = result[0]['objectName'];
        str_objectCreator = result[0]['objectCreator'];
        str_objectCreatedDate = result[0]['objectCreatedDate'];
        str_objectCreatedTime = result[0]['objectCreatedTime'];
        str_objectText = result[0]['objectText'];
        str_objectStatus = result[0]['objectStatus'];
        str_presentationVideoLink = result[0]['presentationVideoLink'];
        str_securityVideoLink = result[0]['securityVideoLink'];

    
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

    if(canEdit(request))
    {
        var newresearchobjectCSS = readHTML('./master-frame/newemployee_css.html');
        response.write(newresearchobjectCSS);
        var newresearchobjecteJS = readHTML('./master-frame/newresearchobject_js.html');
        response.write(newresearchobjecteJS);
        response.write(htmlVirusimagesCSS);
        var newresearchobjecteJS = readHTML('./master-frame/newresearchobject.html');


        let editOutput = pug_editresearchobject({
            id: id,
            objectNumber: str_objectNumber,
            objectName:     str_objectName,
            objectCreator: str_objectCreator,
            objectCreatedDate: str_objectCreatedDate,
            objectCreatedTime: str_objectCreatedTime,
            objectText: str_objectText,
            objectStatus: str_objectStatus,
            presentationVideoLink: str_presentationVideoLink,
            securityVideoLink: str_securityVideoLink,
        });
        editOutput += `<button style="margin-top:10px; padding:6px 14px; background:#4682B4;
                 color:#000; border:1px solid #000; border-radius:0; font-size:12px; font-weight:bold; cursor:pointer;">`
                if (await backupVirus(result)) {
                    editOutput += "Virus is now backed up";
                } else {
                    editOutput += "Error backing up virus";
                }
                editOutput += "</button></div>"

        response.write(editOutput);
        response.write(getVirusImagesHTML(id));
    }
    else
    {
        response.write("You are not logged in")
    }
    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();

    }
    sqlQuery();

});

module.exports = router;