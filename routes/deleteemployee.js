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
router.get('/:id', (request, response) =>
{
    // takes in params
    const id = request.params.id;

    //opens database
    const ADODB = require('node-adodb');
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb');

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

        if(request.session.loggedin)
        {
	        const result = await connection.execute("DELETE FROM employee WHERE id="+id+"");

            response.write("Employee deleted <br />");
            response.write("<a href=\"http://localhost:3000/api/personnelregistry\" style=\"color:#336699;\">Delete another employee</a>");
        }
        else
        {
            response.write("You are not logged in")
        }





    response.write("Employee deleted");

    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();

    }
    sqlQuery()
});

module.exports = router;