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

// router for Form for new employees
router.post('/', (request, response) =>
{
    // recives form data to variables
    const employeecode = request.body.femployeecode;
    const name = request.body.fname;
    const dateofbirth = request.body.fdateofbirth;
    const height = request.body.fheight;
    const weight = request.body.fweight;
    const bloodtype = request.body.fbloodtype;
    const sex = request.body.fsex;
    const rank = request.body.frank;
    const department = request.body.fdepartment;
    const securityaccess = request.body.fsecurityaccess;
    const background = request.body.fbackground;
    const strengths = request.body.fstrengths;
    const weaknesses = request.body.fweaknesses;

    // creates date
    let ts = Date.now();
    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth()+1;
    let year = date_ob.getFullYear();
    const signaturedate = date + "." + month + "." + year;

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
        
	    const result = await connection.execute("INSERT INTO employee (employeecode,name,signaturedate,dateofbirth,height,weight,bloodtype,sex,rank,department,securityaccesslevel,background,strengths,weaknesses) VALUES ('"+employeecode+"','"+name+"','"+signaturedate+"','"+dateofbirth+"','"+height+"','"+weight+"','"+bloodtype+"','"+sex+"','"+rank+"','"+department+"','"+securityaccess+"','"+background+"','"+strengths+"','"+weaknesses+"')");
        response.write("Employee added to database! <br /><p /><a href=\"http://localhost:3000/api/newemployee\" style=\"color:#336699;\">Create new employee</a>");
        
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

// router for adding employees to the database
router.get('/', (request, response) =>
{
    
    response.write(htmlHead);
    response.write(htmlHeader);
    if(request.session.loggedin==true){var htmlLoggedInMenuCSS = readHTML('./master-frame/loggedinmenu_css.html');response.write(htmlLoggedInMenuCSS);}
    if(request.session.loggedin==true){var htmlLoggedInMenuJS = readHTML('./master-frame/loggedinmenu_js.html');response.write(htmlLoggedInMenuJS);}
    if(request.session.loggedin==true){var htmlLoggedInMenu = readHTML('./master-frame/loggedinmenu.html');response.write(htmlLoggedInMenu);}

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
        var newEmployeeCSS = readHTML('./master-frame/newemployee_css.html');
            response.write(newEmployeeCSS);
            var newEmployeeJS = readHTML('./master-frame/newemployee_js.html');
            response.write(newEmployeeJS);
            var newEmployee = readHTML('./master-frame/newemployee.html');
            response.write(newEmployee);
    }
    else
    {
        response.write("Not logged in");
    }   
    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();
});



module.exports = router;