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

router.use(express.static('./public'));

var htmlHead = readHTML('./master-frame/head.html');
var htmlHeader = readHTML('./master-frame/header.html');
var htmlMenu = readHTML('./master-frame/menu.html');
var htmlInfoStart = readHTML('./master-frame/infostart.html');
var htmlInfoStop = readHTML('./master-frame/infostop.html');
var htmlBottom = readHTML('./master-frame/bottom.html');

// Default-router, if no other button was pressed
router.get('/', (request, response) =>
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

    var htmlInfo = readHTML('./public/text/index.html');
    response.write(htmlInfo);

    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();
});

// Router for info-page, if a button was pressed
router.get('/:infotext', (request, response) =>
{
    const infotext = request.params.infotext;
    if(infotext == "")
    {
        var htmlMenu = readHTML('./master-frame/menu.html');
    }
    else
    {
        var htmlMenu = readHTML('./master-frame/menu_back.html');
    }


    
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

    //var htmlInfo = readHTML('./public/text/index.html');
    const filepath = path.resolve(__dirname, '../public/text/'+infotext+'.html');
    if(fs.existsSync(filepath))
    {
        htmlInfo = readHTML('./public/text/'+infotext+'.html');
    }
    else
    {
        htmlInfo = readHTML('./public/text/index.html');
    }

    response.write(htmlInfo);

    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();
});
module.exports = router;