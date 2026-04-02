const express = require('express');
const router = express.Router();

var cookieParser = require('cookie-parser');
router.use(cookieParser());
router.use(express.urlencoded({ extended: true })); // missing - needed for request.body

const readHTML = require('../readHTML.js');
var fs = require('fs');
const path = require('path');

const pug = require('pug');
const { response } = require('express');
const pug_loggedinmenu = pug.compileFile('./master-frame/loggedinmenu.html');

router.use(express.static('./public'));

var htmlHead = readHTML('./master-frame/head.html');
var htmlHeader = readHTML('./master-frame/header.html');
var htmlMenu = readHTML('./master-frame/menu.html');
var htmlInfoStart = readHTML('./master-frame/infostart.html');
var htmlInfoStop = readHTML('./master-frame/infostop.html');
var htmlBottom = readHTML('./master-frame/bottom.html');

const canEdit = (request) => {
    if (!request.session.loggedin) return false;
    const level = request.session.securityaccesslevel;
    return ['A', 'B'].includes(level);
};

router.post('/', (request, response) =>
{
    const objectNumber = request.body.fobjectNumber;
    const objectName = request.body.fobjectName;
    const objectText = request.body.fobjectText;
    const objectStatus = request.body.fobjectStatus;
    const presentationVideoLink = request.body.fpresentationVideoLink;
    const securityVideoLink = request.body.fsecurityVideoLink;

    //auto generates objectCreator as the loggedin users employeecode, same with time and date
    const objectCreator = request.session.username;
    let date_ob = new Date();
    const objectCreatedDate = date_ob.getDate() + "." + (date_ob.getMonth()+1) + "." + date_ob.getFullYear();
    const objectCreatedTime = date_ob.getHours() + ":" + String(date_ob.getMinutes()).padStart(2, '0');

    const ADODB = require('node-adodb');
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb');

    async function sqlQuery()
    {
        response.write(htmlHead);
        response.write(htmlHeader);
        if(request.session.loggedin==true){var htmlLoggedInMenuCSS = readHTML('./master-frame/loggedinmenu_css.html');response.write(htmlLoggedInMenuCSS);}
        if(request.session.loggedin==true){var htmlLoggedInMenuJS = readHTML('./master-frame/loggedinmenu_js.html');response.write(htmlLoggedInMenuJS);}
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
            const result = await connection.execute("INSERT INTO ResearchObjects (objectNumber, objectName, objectCreator, objectCreatedDate, objectCreatedTime, objectText, objectStatus, presentationVideoLink, securityVideoLink) VALUES('"+objectNumber+"','"+objectName+"','"+objectCreator+"','"+objectCreatedDate+"','"+objectCreatedTime+"','"+objectText+"','"+objectStatus+"','"+presentationVideoLink+"','"+securityVideoLink+"')");
            response.write("Research object added! <br /><p /><a href=\"http://localhost:3000/api/newresearchobject\" style=\"color:#336699;\">Add another</a>");
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

router.get('/', (request, response) =>
{
    response.write(htmlHead);
    response.write(htmlHeader);
    if(request.session.loggedin==true){var htmlLoggedInMenuCSS = readHTML('./master-frame/loggedinmenu_css.html');response.write(htmlLoggedInMenuCSS);}
    if(request.session.loggedin==true){var htmlLoggedInMenuJS = readHTML('./master-frame/loggedinmenu_js.html');response.write(htmlLoggedInMenuJS);}
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
        var newResearchObjectCSS = readHTML('./master-frame/newemployee_css.html');
        response.write(newResearchObjectCSS);
        var newResearchObjectJS = readHTML('./master-frame/newresearchobject_js.html');
        response.write(newResearchObjectJS);
        var newResearchObject = readHTML('./master-frame/newresearchobject.html');
        response.write(newResearchObject);
    }
    else
    {
        response.write("You are not authorised to view this page.");
    }
    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();
});

module.exports = router;