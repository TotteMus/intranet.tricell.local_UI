const express = require('express');
const router = express.Router();

var cookieParser = require('cookie-parser');
router.use(cookieParser());

router.use(express.static('./public'));
const path = require('path');

const pug = require('pug');
const { response } = require('express');
const pug_loggedinmenu = pug.compileFile('./master-frame/loggedinmenu.html');

//read master-frame
const readHTML = require('../readHTML.js');
var fs = require('fs');

var htmlHead = readHTML('./master-frame/head.html');
var htmlHeader = readHTML('./master-frame/header.html');
var htmlMenu = readHTML('./master-frame/menu.html');
var htmlInfoStart = readHTML('./master-frame/infostart.html');
var htmlInfoStop = readHTML('./master-frame/infostop.html');
var htmlBottom = readHTML('./master-frame/bottom.html');

//router
router.get('/', (request, response) =>
{
    //recive variables
    const employeecode = request.query.employeecode;
    const password = request.query.password;

    //opens database
    const ADODB = require('node-adodb');
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb');

    async function sqlQuery()
    {
	    const result = await connection.query("SELECT passwd, lastlogin, logintimes, lockout FROM users WHERE employeecode='"+employeecode+"'");
        if(result=="")
            {
                response.redirect('/api/login/unsuccessful');
            }
            else
            {
                //read all user varables
                str_password = result[0]['passwd'];
                str_lastlogin = result[0]['lastlogin'];
                str_logintimes = result[0]['logintimes'];
                if(str_logintimes==""){str_logintimes="0";};

                async function sqlQuery3()
                {
                    const result3 = await connection.query("SELECT name, securityaccesslevel FROM employee WHERE employeecode='"+employeecode+"'");
                    str_name = result3[0]['name'];
                    str_securityaccesslevel = result3[0]['securityaccesslevel'];
                                    str_lockout = result[0]['lockout'];
                //see if user is locked out
                if(str_lockout==null)
                {
                    if(str_password==password)
                    {
                        //start session
                        request.session.loggedin=true;
                        request.session.username= employeecode;
                        request.session.securityaccesslevel = str_securityaccesslevel;

                        //update database
                        let int_logintimes = parseInt(str_logintimes)+1;
                        let ts = Date.now();
                        let date_ob = new Date(ts);
                        let date = date_ob.getDate();
                        let month = date_ob.getMonth()+1;
                        let year = date_ob.getFullYear();
                        str_lastlogin = date + "." + month + "." + year;

                        //create cookies
                        response.cookie('employeecode', employeecode);
                        response.cookie('name', str_name);
                        response.cookie('lastlogin', str_lastlogin);
                        response.cookie('logintimes', int_logintimes);

                        // Create sorting settings cookies
                        response.cookie("sortAmount", 20);
                        response.cookie("sortType", "ID");

                        //update database               
                        async function sqlQuery2()
                        {
                            const result2 = await connection.execute("UPDATE users SET logintimes='"+int_logintimes+"', lastlogin='"+str_lastlogin+"' WHERE employeecode='"+employeecode+"'");
                            request.session.save(() => {
                            response.redirect('/api/login/successful');
                            });
                        }
                        sqlQuery2();

                        //response.redirect('/api/login/successful');
                }
                else
                {   
                    response.redirect('/api/login/unsuccessful');
                }
            }
            else
            {
                response.redirect('/api/login/unsuccessful');
            }
                }
                sqlQuery3();
        }
    }
	sqlQuery();
});

//router for succesful login
router.get('/:successful', function(request, response) 
{
    const ADODB = require('node-adodb');
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/activity_log.mdb');

    async function activityLog()
    {
        //writes master-frame top
        response.write(htmlHead);
        response.write(htmlHeader);
        response.write(htmlMenu);
        response.write(htmlInfoStart);

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

        if(request.session.loggedin==true)
        {
            response.write('Login successful!');

            const deleteRow150 = connection.execute("DELETE FROM Log WHERE ID NOT IN (SELECT TOP 150 ID FROM Log ORDER BY ID DESC)");

            // Getting date of login
            let ts = Date.now();
            let date_ob = new Date(ts);
            let date = date_ob.getDate();
            let month = date_ob.getMonth()+1;
            let year = date_ob.getFullYear();
            let loginDate = date + "." + month + "." + year;
            // Getting time of login
            let hourOfLogin = date_ob.getHours();
            let minuteOfLogin = date_ob.getMinutes();
            let timeOfLogin = hourOfLogin + ":" + minuteOfLogin;


            const updateLog = connection.execute("INSERT INTO Log (Activity, EmployeeCode, [Name], [Date], [Time]) " +
                "VALUES (\"Login\", \""+ request.cookies.employeecode +"\", \""+ request.cookies.name +"\", \""+ loginDate +"\", \""+ timeOfLogin +"\")");
        }
        else
        {
            response.write('Login unsuccessful!');  
        }

        //wtites master frame bottom
        response.write(htmlInfoStop);
        response.write(htmlBottom);
        response.end()

    }
    activityLog();
});

//router for unsuccessful login
router.get('/:unsuccessful', function(request, response) 
{
    //writes master-frame top
    response.write(htmlHead);
    response.write(htmlHeader);
    response.write(htmlMenu);
    response.write(htmlInfoStart);

    response.write('Login unsuccessful!');

    //wtites master frame bottom
    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end()
});

module.exports = router;