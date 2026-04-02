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
const pug_loggedinmenu = pug.compileFile('./master-frame/loggedinmenu.html');
const pug_editemployee = pug.compileFile('./master-frame/editemployee.html');

router.use(express.static('./public'));

var htmlHead = readHTML('./master-frame/head.html');
var htmlHeader = readHTML('./master-frame/header.html');
var htmlMenu = readHTML('./master-frame/menu.html');
var htmlInfoStart = readHTML('./master-frame/infostart.html');
var htmlInfoStop = readHTML('./master-frame/infostop.html');
var htmlBottom = readHTML('./master-frame/bottom.html');

// form to edit employees
router.get('/:id', function(request, response) 
{
    // recive in params
    var id = request.params.id;

        //opens database
    const ADODB = require('node-adodb');
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb');


    async function sqlQuery()
    {
    const result = await connection.query("SELECT * FROM employee WHERE id="+id+"");

    //read variables
        let str_employeecode = "" + result[0]['employeecode'];
        let str_name = "" + result[0]['name'];
        let str_dateofbirth = "" + result[0]['dateofbirth'];
        let str_rank = "" + result[0]['rank'];
        let str_securityaccesslevel = "" + result[0]['securityaccesslevel'];
        let str_signaturedate = "" + result[0]['signaturedate'];
        let str_sex = "" + result[0]['sex'];
        let str_bloodtype = "" + result[0]['bloodtype'];
        let str_height = "" + result[0]['height'];
        let str_weight = "" + result[0]['weight'];
        let str_department = "" + result[0]['department'];
        let str_background = "" + result[0]['background'];
        let str_strengths = "" + result[0]['strengths'];
        let str_weaknesses = "" + result[0]['weaknesses'];

    
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
        const path = "./public/photos/"+str_employeecode+".jpg";
        if(fs.existsSync(path))
        {
            photo = "photos/"+str_employeecode+".jpg";
        }
        else
        {
            photo = "images/default.jpg";
        }
        var newEmployeeCSS = readHTML('./master-frame/newemployee_css.html');
        response.write(newEmployeeCSS);
        var newEmployeJS = readHTML('./master-frame/newemployee_js.html');
        response.write(newEmployeJS);
        var newEmployeJS = readHTML('./master-frame/newemployee.html');

        response.write(pug_editemployee({
            photo: photo,
            id: id,
            employeecode: str_employeecode,
            name:     str_name,
            dateofbirth: str_dateofbirth,
            signaturedate: str_signaturedate,
            sex: str_sex,
            bloodtype: str_bloodtype,
            height: str_height,
            weight: str_weight,
            rank: str_rank,
            securityaccesslevel: str_securityaccesslevel,
            department: str_department,
            background: str_background,
            strengths: str_strengths,
            weaknesses: str_weaknesses,
        }));

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
    const employeecode = request.body.femployeecode;
    const name = request.body.fname;

    
    const formatDate = (d) => {
        if (!d) return 'NULL';
        const [y, m, day] = d.split('-');
        return `#${m}/${day}/${y}#`;
    };

    const signaturedate = formatDate(request.body.fsignaturedate);
    const dateofbirth = formatDate(request.body.fdateofbirth);
    
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

    //opens database
    const ADODB = require('node-adodb');
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb');

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
    if(request.session.loggedin)
    {   
	    const result = await connection.execute(
        "UPDATE employee SET " +
        "employeecode='" + employeecode + "'," +
        "name='" + name + "'," +
        "signaturedate=" + signaturedate + "," +
        "dateofbirth=" + dateofbirth + "," +
        "height='" + height + "'," +
        "weight='" + weight + "'," +
        "bloodtype='" + bloodtype + "'," +
        "sex='" + sex + "'," +
        "rank='" + rank + "'," +
        "department='" + department + "'," +
        "securityaccesslevel='" + securityaccess + "'," +
        "background='" + background + "'," +
        "strengths='" + strengths + "'," +
        "weaknesses='" + weaknesses + "' " +
        "WHERE id=" + id
        );
        response.write("Employee edited! <br />");
        response.write("<a href=\"http://localhost:3000/api/personnelregistry\" style=\"color:#336699;\">Edit another employee</a>");
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