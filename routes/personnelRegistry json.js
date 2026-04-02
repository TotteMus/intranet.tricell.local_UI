const express = require('express');
const router = express.Router();

const readHTML = require('../readHTML.js');
var fs = require('fs');
const path = require('path');

router.use(express.static('./public'));

//"läs in" Master-frame
var htmlHead = readHTML('./routes/head.html');
var htmlHeader = readHTML('./routes/header.html');
var htmlMenu = readHTML('./routes/menu.html');
var htmlInfoStart = readHTML('./routes/infostart.html');
var htmlInfoStop = readHTML('./routes/infostop.html');
var htmlBottom = readHTML('./routes/bottom.html');

//default-router for all employees
router.get('/', (request, response) =>
{

    //Writes master frame top
    response.write(htmlHead);
    response.write(htmlHeader);
    response.write(htmlMenu);
    response.write(htmlInfoStart);

    let htmlOutput = "" +
    "<link rel=\"stylesheet\" href=\"css/personnel_registry.css\" \/>" +
    "<table id=\"personnel\">" +
	 "<tr>" +
	  "<td class=\"infoheadinglight\" width=\"130\">EMPLOYEE CODE</td>" +
	  "<td class=\"infoheadingdark\" width=\"210\">&nbsp;NAME</td>" +
	  "<td class=\"infoheadinglight\" width=\"130\">SIGNATURE DATE</td>" +
	  "<td class=\"infoheadinglight\" width=\"130\">RANK</td>" +
	  "<td class=\"infoheadinglight\" width=\"116\">ACCESS LEVEL</td>" +
	 "</tr>" +
    "";

    //opens JSON-file and reads content
	let str_employeecode, str_name, str_signaturedate, str_rank, str_securityaccesslevel;
	const result = require('../data/JSON/personnelregistry.json');
	const count = result['personnelRegistry']['employee'].length;


	for(i=0; i<count; i++)
	{
		str_employeecode = result['personnelRegistry']['employee'][i]['employeecode']; 
		str_name = result['personnelRegistry']['employee'][i]['name'];
		str_signaturedate = result['personnelRegistry']['employee'][i]['signaturedate'];
		str_rank = result['personnelRegistry']['employee'][i]['rank'];
		str_securityaccesslevel = result['personnelRegistry']['employee'][i]['securityaccesslevel'];

		
        htmlOutput +=
    "<tr>" +
	  "<td class=\"infolight\" width=\"130\">"+str_employeecode+"</font></td>" +
	  "<td class=\"infodark\" width=\"210\">&nbsp;<a href=\"http://localhost:3000/api/personnelregistry/"+str_employeecode+"\">"+str_name+"</a></td>" +
	  "<td class=\"infolight\" width=\"130\">"+str_signaturedate+"</font></td>" +
	  "<td class=\"infolight\" width=\"130\">"+str_rank+"</font></td>" +
	  "<td class=\"infolight\" width=\"116\"><big><big>"+str_securityaccesslevel+"</big></big></td>" +
	"</tr>" +
    "";

	}


    htmlOutput += "</table>";
    
    response.write(htmlOutput);

    //wtites master frame bottom
    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();
});

//router for indivudual info
router.get('/:employeeid', (request, response) =>
{
    const employeeid = request.params.employeeid;

    //Writes master frame top
    response.write(htmlHead);
    response.write(htmlHeader);
    response.write(htmlMenu);
    response.write(htmlInfoStart);


    //opens JSON-file and reads content
    let str_employeecode, str_name, str_signaturedate, str_dateofbrith, str_sex, str_bloodtype, str_height, str_weight, str_rank, str_department, str_securityaccesslevel;
    const result = require('../data/JSON/personnelregistry.json');
	const count = result['personnelRegistry']['employee'].length;

    let i;
    for(i=0; i<count; i++)
    {

        if(result['personnelRegistry']['employee'][i]['employeecode'] == employeeid)
        {
            str_employeecode = result['personnelRegistry']['employee'][i]['employeecode'];
        	str_name = result['personnelRegistry']['employee'][i]['name'];
            str_signaturedate = result['personnelRegistry']['employee'][i]['signaturedate'];
            str_dateofbrith = result['personnelRegistry']['employee'][i]['dateofbirth'];
            str_sex = result['personnelRegistry']['employee'][i]['sex'];
            str_bloodtype= result['personnelRegistry']['employee'][i]['bloodtype'];
            str_height = result['personnelRegistry']['employee'][i]['height'];
            str_weight = result['personnelRegistry']['employee'][i]['weight'];
            str_rank = result['personnelRegistry']['employee'][i]['rank'];
            str_department = result['personnelRegistry']['employee'][i]['department'];
            str_securityaccesslevel = result['personnelRegistry']['employee'][i]['securityaccesslevel'];
        }
			
    }


    let htmloutput = "" +
    "<link rel=\"stylesheet\" href=\"css/personnel_registry.css\" \/>\n" +
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

	const result2 = require("../data/JSON/"+employeeid+".json");
    let str_background, str_streagths, str_weaknesses;

    str_background = result2['fields']['Background\n'];
    str_streagths = result2['fields']['Strengths\n'];
    str_weaknesses = result2['fields']['Weaknesses\n'];

	htmloutput += 
	"<h1>Background</h1>\n" + str_background+
	"<p />\n" +
	"<h1>Strengths</h1>\n" + str_streagths+
	"<p />\n" +
	"<h1>Weaknessess</h1>\n" + str_weaknesses+
	"<p />\n"+
	"";

    response.write(htmloutput);





    //wtites master frame bottom
    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();
});

module.exports = router;

