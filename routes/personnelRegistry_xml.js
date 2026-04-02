const express = require('express');
const router = express.Router();
router.use(express.json());

const xml2js = require('xml2js');
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

    //opens XML-file and reads content
    var fsx = require('fs');
    let xmltext = fsx.readFileSync('./data/xml/personnelregistry.xml');
    xmltext = xmltext.toString();
    xmltext = xmltext.replace(/[\n\t\r]/g,"");

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

    let xmlArray = xmltext.split('<employee>')
    xmlArray.shift();

    let str_employeecode, str_name, str_signaturedate, str_rank, str_securityaccesslevel;
    xmlArray.forEach(printEmployee);
    function printEmployee(employee)
    {
        str_employeecode = employee.substring(employee.indexOf('<employeecode>')+14,employee.lastIndexOf('</employeecode>'));
        str_name = employee.substring(employee.indexOf('<name>')+6,employee.lastIndexOf('</name>'));
        str_signaturedate = employee.substring(employee.indexOf('<signaturedate>')+15,employee.lastIndexOf('</signaturedate>'));
        str_rank = employee.substring(employee.indexOf('<rank>')+6,employee.lastIndexOf('</rank>'));
        str_securityaccesslevel = employee.substring(employee.indexOf('<securityaccesslevel>')+21,employee.lastIndexOf('</securityaccesslevel>'));

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

    //opens XML-file and reads content
    var fsx = require('fs');
    let xmltext = fsx.readFileSync('./data/xml/personnelregistry.xml');
    xmltext = xmltext.toString();
    xmltext = xmltext.replace(/[\n\t\r]/g,"");

    let str_employeecode, str_name, str_signaturedate, str_dateofbrith, str_sex, str_bloodtype, str_height, str_weight, str_rank, str_department, str_securityaccesslevel;
    
    let count = xmltext.match(/<employee>/g).length;

    /*WHAT WE ARE SUPPOSED TO HAVE BUT TypeError: Cannot read properties of undefined (reading '0') ??????
    xml2js.parseString(xmltext, function(err,result)
    {
        let i;
        for(i=0; i<count; i++)
        {
            if(result['personnelregistry']['employee'][i]['employeecode'] == employeeid)
            {
                str_employeecode = result['personnelregistry']['employee'][i]['employeecode'];
                str_name = result['personnelregistry']['employee'][i]['name'];
                str_signaturedate = result['personnelregistry']['employee'][i]['signaturedate'];
                str_dateofbrith = result['personnelregistry']['employee'][i]['dateofbirth'];
                str_sex = result['personnelregistry']['employee'][i]['sex'];
                str_bloodtype= result['personnelregistry']['employee'][i]['bloodtype'];
                str_height = result['personnelregistry']['employee'][i]['height'];
                str_weight = result['personnelregistry']['employee'][i]['weight'];
                str_rank = result['personnelregistry']['employee'][i]['rank'];
                str_department = result['personnelregistry']['employee'][i]['department'];
                str_securityaccesslevel = result['personnelregistry']['employee'][i]['securityaccesslevel'];
            }

        }

    });
    */

// BUT THIS FUCKING WORKS!?!?!?!?
xml2js.parseString(xmltext, function(err, result)
{
    if(err) {
        console.error('Parsing error:', err);
        return;
    }
    
    // Check if personnelregistry exists
    if(!result.personnelregistry) {
        console.error('No personnelregistry found');
        return;
    }
    
    // Access the employee array
    let employees = result.personnelregistry.employee;
    
    if(!employees || !Array.isArray(employees)) {
        console.error('No employees found');
        return;
    }
    
    // Loop through employees
    for(let i = 0; i < employees.length; i++) {
        let employee = employees[i];
        
        // Check if this is the employee we're looking for
        if(employee.employeecode && employee.employeecode == employeeid) {
            str_employeecode = employee.employeecode;
            str_name = employee.name;
            str_signaturedate = employee.signaturedate;
            str_dateofbrith = employee.dateofbirth;
            str_sex = employee.sex;
            str_bloodtype = employee.bloodtype;
            str_height = employee.height;
            str_weight = employee.weight;
            str_rank = employee.rank;
            str_department = employee.department;
            str_securityaccesslevel = employee.securityaccesslevel;
            
            break;
        }
    }
});

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


    var fsx = require('fs');
    let xmltext2 = fsx.readFileSync("./data/xml/"+employeeid+".xml");
    xmltext2 = xmltext2.toString();
    xmltext2 = xmltext2.replace(/[\n\t\r]/g,"");

    let str_background, str_streagths, str_weaknesses;

    xml2js.parseString(xmltext2, function(err, result2)
    {
        str_background = result2['fields']['Background'];
        str_streagths = result2['fields']['Strengths'];
        str_weaknesses = result2['fields']['Weaknesses'];
    });
htmloutput += 
"<h1>Background</h1>\n" + str_background+
"<p />\n" +
"<h1>Strengths</h1>\n" + str_streagths+
"<p />\n" +
"<h1>Weaknessess</h1>\n" + str_weaknesses+
"<p />\n"+
"";

    response.write(htmloutput);




    //response.write(employeeid);

    //wtites master frame bottom
    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();
});

module.exports = router;

