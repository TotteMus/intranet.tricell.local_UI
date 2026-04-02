const express = require('express');
const router = express.Router();
const ADODB = require('node-adodb');

var cookieParser = require('cookie-parser');
router.use(cookieParser());

const readHTML = require('../readHTML.js');
var fs = require('fs');
const path = require('path');

const pug = require('pug');
const { response } = require('express');
const pug_loggedinmenu = pug.compileFile('./master-frame/loggedinmenu.html');


//makes so only A and B secrityaccess can edit, delete and add new objects
const canEdit = (request) => {
    if (!request.session.loggedin) return false;
    const level = request.session.securityaccesslevel;
    return ['A', 'B'].includes(level);
};

router.use(express.static('./public'));

//"läs in" Master-frame
var htmlHead = readHTML('./master-frame/head.html');
var htmlHeader = readHTML('./master-frame/header.html');
var htmlMenu = readHTML('./master-frame/menu.html');
var htmlInfoStart = readHTML('./master-frame/infostart.html');
var htmlInfoStop = readHTML('./master-frame/infostop.html');
var htmlBottom = readHTML('./master-frame/bottom.html');

//default-router for all employees
router.get('/', (request, response) =>
{

    //opens database and reads data
	let str_employeecode, str_name, str_signaturedate, str_rank, str_securityaccesslevel;
	const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb');
	async function sqlQuery()
	{

	    //Writes master frame top
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
				lastlogin : request.cookies.lastlogin,
				canEdit: ['A', 'B'].includes(request.session.securityaccesslevel)
			}));
		}
		
    	response.write(htmlMenu);
    	response.write(htmlInfoStart);

		//let htmlOutput = "" +
    	//"<link rel=\"stylesheet\" href=\"css/personnel_registry.css\" \/>" +

		//"<table borde=\"0\"><tr>"+
		  //"<td width=\"350\" align=\"left\"><h2>Personnel Registry:</h2></td>";


		//if (request.session.loggedin)
		//{
		  //htmlOutput += "<td width=\"350\" align=\"right\"><a href=\"http://localhost:3000/api/newemployee\" style=\"color:#336699;\">Add new employee</a></td>";
		//}
		//htmlOutput += "</tr></table>" +

    	//"<table id=\"personnel\">" +
	 	//"<tr>" +
	  	//"<td class=\"infoheadinglight\" width=\"130\">EMPLOYEE CODE</td>" +
	  	//"<td class=\"infoheadingdark\" width=\"210\">&nbsp;NAME</td>" +
	  	//"<td class=\"infoheadinglight\" width=\"130\">SIGNATURE DATE</td>" +
	  	//"<td class=\"infoheadinglight\" width=\"130\">RANK</td>" +
	  	//"<td class=\"infoheadinglight\" width=\"116\">ACCESS LEVEL</td>" ;
		
		let htmlOutput =""+
        "<link rel=\"stylesheet\" href=\"css/personnel_registry.css\" \/>";

		        if(request.session.loggedin)
        {
            htmlOutput +="<table border=\"0\">";
            htmlOutput +="<tr><td width=\"350\" align=\"left\">";
            htmlOutput +="<h2>Personnel Registry:</h2>\n";
            htmlOutput +="</td><td width=\"350\" align=\"right\">";
            htmlOutput +="<a href=\"http://localhost:3000/api/newemployee\" style=\"color:#336699;text-decoration:none;\">Add new employee</a>";
            htmlOutput +="</td></tr></table>";
        }
        else
        {
            htmlOutput +="<h2>Personnel Registry:</h2>\n";
        }

        htmlOutput += "<div id=\"table-resp\">"+
        "<div id=\"table-header\">\n"+
        "<div class=\"table-header-cell-light\">Employee Code</div>\n"+
        "<div class=\"table-header-cell-dark\">Name</div>\n"+
        "<div class=\"table-header-cell-light\">Signature Date</div>\n"+
        "<div class=\"table-header-cell-light\">Rank</div>\n"+
        "<div class=\"table-header-cell-light\">Access Level</div>\n";
        if(request.session.loggedin)
        {
            htmlOutput +="<div class=\"table-header-cell-light\">Edit</div>\n"+
            "<div class=\"table-header-cell-light\">Delete</div>\n";
        }
	 	htmlOutput += "</div>" +
    	"";

		const result = await connection.query('SELECT id, employeecode, name, signaturedate, rank, securityaccesslevel FROM employee ORDER BY id ASC');
		var count = result.length;

		let i;
		for(i=0; i<count; i++)
		{
			str_id = result[i]['id'];
			str_employeecode = result[i]['employeecode'];
			str_name = result[i]['name'];
			str_signaturedate = result[i]['signaturedate'];
			str_rank = result[i]['rank'];
			str_securityaccesslevel = result[i]['securityaccesslevel'];

			//htmlOutput +=
    		//"<tr>" +
	  		//"<td class=\"infolight\" width=\"130\">"+str_employeecode+"</font></td>" +
	  		//"<td class=\"infodark\" width=\"210\">&nbsp;<a href=\"http://localhost:3000/api/personnelregistry/"+str_employeecode+"\">"+str_name+"</a></td>" +
	  		//"<td class=\"infolight\" width=\"130\">"+str_signaturedate+"</font></td>" +
	  		//"<td class=\"infolight\" width=\"130\">"+str_rank+"</font></td>" +
	  		//"<td class=\"infolight\" width=\"116\"><big><big>"+str_securityaccesslevel+"</big></big></td>";
			
			htmlOutput += "<div class=\"resp-table-row\">\n";
			htmlOutput += "<div class=\"table-body-cell\">"+str_employeecode+"</div>\n";
			htmlOutput += "<div class=\"table-body-cell-bigger\"><a href=\"http://localhost:3000/api/personnelregistry/"+str_employeecode+"\">"+str_name+"</a></div>\n";
			htmlOutput += "<div class=\"table-body-cell\">"+str_signaturedate+"</div>\n";
			htmlOutput += "<div class=\"table-body-cell\">"+str_rank+"</div>\n";
			htmlOutput += "<div class=\"table-body-cell\">"+str_securityaccesslevel+"</div>\n";
            if(request.session.loggedin)
            {
                htmlOutput += "<div class=\"table-body-cell\"><a href=\"http://localhost:3000/api/editemployee/" + str_id + "\" style=\"color:#336699;text-decoration:none;\">E</a></div>\n";
                htmlOutput += "<div class=\"table-body-cell\"><a href=\"http://localhost:3000/api/deleteemployee/" + str_id + "\" style=\"color:#336699;text-decoration:none;\">D</a></div>\n";
            }
			
			htmlOutput += "</div>\n";
		}

    	response.write(htmlOutput);		

    	//wtites master frame bottom

    	response.write(htmlInfoStop);
    	response.write(htmlBottom);
    	response.end();

	}
	sqlQuery();


});

//router for indivudual info
router.get('/:employeeid', (request, response) =>
{
    const employeeid = request.params.employeeid;

	const ADODB = require('node-adodb');
	const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb');
	async function sqlQuery()
	{
    	//Writes master frame top
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
				lastlogin : request.cookies.lastlogin,
				canEdit: ['A', 'B'].includes(request.session.securityaccesslevel)
			}));
		}

    	response.write(htmlHeader);
    	response.write(htmlMenu);
    	response.write(htmlInfoStart);

		//Send SQL-qury to database and reads variables
		const result = await connection.query("SELECT employeecode, name, signaturedate, rank, securityaccesslevel, dateofbirth, sex, bloodtype, height, weight, department, background, strengths, weaknesses FROM employee WHERE employeecode='"+employeeid+"'");
			str_employeecode      = result[0]['employeecode'];
			str_name              = result[0]['name'];
			str_signaturedate     = result[0]['signaturedate'];
			str_rank              = result[0]['rank'];
			str_securityaccesslevel = result[0]['securityaccesslevel'];
			str_dateofbrith       = result[0]['dateofbirth'];
			str_sex               = result[0]['sex'];
			str_bloodtype         = result[0]['bloodtype'];
			str_height            = result[0]['height'];
			str_weight            = result[0]['weight'];
			str_department        = result[0]['department'];
			str_background        = result[0]['background'];
			str_strengths         = result[0]['strengths']; 
			str_weaknesses        = result[0]['weaknesses'];


			//crates HTML-textstring for table and output for XML-data
			let htmloutput = "" +
    		"<link rel=\"stylesheet\" href=\"css/personnel_registry_employee.css\" \/>\n" +
    		"<h1>Personnel Registry - "+str_employeecode+"\</h1>\n"+
			"<table id=\"infomiddle\">\n"+
			 "<tr>\n"+
			  "<td width=\"166\" valign=\"top\">\n"+
			"<table id=\"photocol\">\n"+
			 "<tr>\n"+
			  "<td id=\"photobox\"><img src=\"photos/"+str_employeecode+".jpg\"\" alt=\""+str_employeecode+"\" width=\"164\" /></td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"tablespacer\">\n"+
	 		 "</tr>\n"+
			 "<tr>\n"+
			  "<td id=\"employeecode\">EMPLOYEE CODE: </b><br /><b>"+str_employeecode+"</b></td>\n"+
			 "</tr>\n"+
			 "<tr><td class=\"tablespacer\">\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td id=\"securitylevel\">SECURITY CLEARANCE LEVEL: </b><br /><big><big><big>"+str_securityaccesslevel+"</big></big></big></td>\n"+
			 "</tr>\n"+
			"</table>\n"+
  			"</td>\n"+
  			"<td width=\"135\" valign=\"top\">\n"+
			"<table>\n"+
			 "<tr>\n"+
			  "<td class=\"variablecol\">NAME: &nbsp;</td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"tablespacer\"></tr>\n"+
			 "<tr>\n"+
			  "<td class=\"variablecol\">DATE OF BIRTH: &nbsp;</td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"tablespacer\"></tr>\n"+
			 "<tr>\n"+
			  "<td class=\"variablecol\">SEX: &nbsp;</td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"tablespacer\"></tr>\n"+
			 "<tr>\n"+
			  "<td class=\"variablecol\">BLOOD TYPE: &nbsp;</td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"tablespacer\"></tr>\n"+
			 "<tr>\n"+
			  "<td class=\"variablecol\">HEIGHT: &nbsp;</td>\n"+
			"</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"tablespacer\"></tr>\n"+
			 "<tr>\n"+
			  "<td class=\"variablecol\">WEIGHT: &nbsp;</td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"tablespacer\"></tr>\n"+
			 "<tr>\n"+
			  "<td class=\"variablecol\">DEPARTMENT: &nbsp;</td>\n"+
			"</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"tablespacer\"></tr>\n"+
			 "<tr>\n"+
			  "<td class=\"variablecol\">RANK: &nbsp;</td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"tablespacer\"></tr>\n"+
			"</table>\n"+
	  		"</td>\n"+
	  		"<td width=\"245\" valign=\"top\">\n"+
			"<table>\n"+
			"<tr>\n"+
			  "<td class=\"valuecol\">"+str_name+"</td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			 "<td class=\"blackline\"></td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"tablespacer\">\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"valuecol\">"+str_dateofbrith+"</td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"blackline\"></td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"tablespacer\">\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"valuecol\">"+str_sex+"</td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"blackline\"></td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"tablespacer\">\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"valuecol\">"+str_bloodtype+"</td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"blackline\"></td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"tablespacer\">\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"valuecol\">"+str_height+"</td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"blackline\"></td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"tablespacer\">\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"valuecol\">"+str_weight+"</td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"blackline\"></td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"tablespacer\">\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"valuecol\">"+str_department+"</td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"blackline\"></td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"tablespacer\">\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"valuecol\">"+str_rank+"</td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"blackline\"></td>\n"+
			 "</tr>\n"+
			 "<tr>\n"+
			  "<td class=\"tablespacer\">\n"+
			 "</tr>\n"+
				"</table>\n"+
              "</td>\n"+
              "<td width=\"182\" valign=\"top\">\n"+
  	 			"</td>\n"+
				"</tr>\n"+
				"</table>\n"
    			"";
    	
		htmlOutput = htmloutput += 
		"<h1>Background</h1>\n" + str_background+
		"<p />\n" +
		"<h1>Strengths</h1>\n" + str_strengths+
		"<p />\n" +
		"<h1>Weaknessess</h1>\n" + str_weaknesses+
		"<p />\n"+
		"";

		response.write(htmlOutput);

    	//wtites master frame bottom
    	response.write(htmlInfoStop);
    	response.write(htmlBottom);
    	response.end();
	}
	sqlQuery();
});

module.exports = router;

