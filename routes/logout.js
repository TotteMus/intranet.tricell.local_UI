const express = require('express');
const router = express.Router();

const readHTML = require('../readHTML.js');
var fs = require('fs');
const path = require('path');

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
    request.session.destroy();

    response.write(htmlHead);
    response.write(htmlHeader);
    //if(request.session.loggedin==true){var htmlLoggedInMenuCSS = readHTML('./master-frame/loggedinmenu_css.html');response.write(htmlLoggedInMenuCSS);}
    //if(request.session.loggedin==true){var htmlLoggedInMenuJS = readHTML('./master-frame/loggedinmenu_js.html');response.write(htmlLoggedInMenuJS);}
    //if(request.session.loggedin==true){var htmlLoggedInMenu = readHTML('./master-frame/loggedinmenu.html');response.write(htmlLoggedInMenu);}
    response.write(htmlMenu);
    response.write(htmlInfoStart);

    response.write("You have been logged out!")

    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();
});

module.exports = router;