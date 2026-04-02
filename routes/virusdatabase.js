const express = require('express');
const router = express.Router();

router.use(express.static('./public'));
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
// --------------------- Läs in Masterframen --------------------------------
const readHTML = require('../readHTML.js');
const fs = require('fs');
const { json } = require('express');

var htmlHead = readHTML('./master-frame/head.html');
var htmlHeader = readHTML('./master-frame/header.html');
var htmlMenu = readHTML('./master-frame/menu.html');    
var htmlInfoStart = readHTML('./master-frame/infoStart.html');
var htmlInfoStop = readHTML('./master-frame/infoStop.html');
var htmlBottom = readHTML('./master-frame/bottom.html');

// ---------------------- List all viruses, Metod 4: Databas -------------------------------
router.get('/', (request, response) =>
{    
    // Öppna databasen
    const ADODB = require('node-adodb');
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb;');

    async function sqlQuery()
    {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(htmlHead);
        if(request.session.loggedin)
        {
            htmlLoggedinMenuCSS = readHTML('./master-frame/loggedinmenu_css.html');
            response.write(htmlLoggedinMenuCSS);
            htmlLoggedinMenuJS = readHTML('./master-frame/loggedinmenu_js.html');
            response.write(htmlLoggedinMenuJS);
            //htmlLoggedinMenu = readHTML('./masterframe/loggedinmenu.html');
            //response.write(htmlLoggedinMenu);
            response.write(pug_loggedinmenu({
                employeecode: request.cookies.employeecode,
                name: request.cookies.name,
                logintimes: request.cookies.logintimes,
                lastlogin: request.cookies.lastlogin,
                canEdit: ['A', 'B'].includes(request.session.securityaccesslevel)
              }));
        }
        response.write(htmlHeader);
        response.write(htmlMenu);
        response.write(htmlInfoStart);

        // Skapa HTML-textsträng för tabellen för utskrift av XML-data
        let htmlOutput = "<link rel=\"stylesheet\" href=\"css/personnel_registry.css\" />" +
        "<style>" +
        ".row-archived { background-color: #e0e0e0 !important; color: #777 !important; }" +
        ".row-archived a { color: #666 !important; }" +
        "</style>";

        if(canEdit(request))
        {
            htmlOutput +="<table border=\"0\">";
            htmlOutput +="<tr><td width=\"350\" align=\"left\">";
            htmlOutput +="<h2>Reaserch Object:</h2>\n";
            htmlOutput +="</td><td width=\"350\" align=\"right\">";
            htmlOutput +="<a href=\"http://localhost:3000/api/newresearchobject\" style=\"color:#336699;text-decoration:none;\">Add Research Object</a>";
            htmlOutput +="</td></tr></table>";
        }
        else
        {
            htmlOutput +="<h2>Reaserch Object:</h2>\n";
        }

        htmlOutput +="<div id=\"table-resp\">"+
        "<div id=\"table-header\">\n"+
        "<div class=\"table-header-cell-light\">ID</div>\n"+
        "<div class=\"table-header-cell-dark\">Name</div>\n"+
        "<div class=\"table-header-cell-light\">Created</div>\n"+
        "<div class=\"table-header-cell-light\">By</div>\n"+
        "<div class=\"table-header-cell-light\">Entries</div>\n"+
        "<div class=\"table-header-cell-light\">Last entry</div>\n";
        if(canEdit(request))
        {
            htmlOutput +="<div class=\"table-header-cell-light\">Edit</div>\n"+
            "<div class=\"table-header-cell-light\">Delete</div>\n";
        }
        htmlOutput +="</div>\n\n"+
        "<div id=\"table-body\">\n";
        "";

        //Query for both researchObject and researchEntries
        const result = await connection.query("SELECT ro.id, ro.objectNumber, ro.objectName, ro.objectCreatedDate, ro.objectCreator, ro.objectStatus, (SELECT COUNT(*) FROM ResearchEntries re WHERE CStr(re.researchObjectId) = CStr(ro.id)) AS entryCount, (SELECT MAX(re.entryDate) FROM ResearchEntries re WHERE CStr(re.researchObjectId) = CStr(ro.id)) AS lastEntryDate FROM ResearchObjects ro");

        // Loop through and write every virus
        for(let i = 0; i < result.length; i++)
        {
            const row = result[i];

            // hide archived rows from non-A users
            if(row.objectStatus === 'archive' && (request.session.securityaccesslevel || '').trim().toUpperCase() !== 'A')
            {
                continue;
            }

            const archiveClass = (row.objectStatus === 'archive') ? 'row-archived' : '';

            htmlOutput += "<div class=\"resp-table-row " + archiveClass + "\">\n";
            htmlOutput += "<div class=\"table-body-cell\">" + row.objectNumber + "</div>\n";
            htmlOutput += "<div class=\"table-body-cell-bigger\"><a href=\"http://localhost:3000/api/virusdatabase/" + row.id + "\">" + row.objectName + "</a></div>\n";
            htmlOutput += "<div class=\"table-body-cell\">" + row.objectCreatedDate + "</div>\n";
            htmlOutput += "<div class=\"table-body-cell\">" + row.objectCreator + "</div>\n";
            htmlOutput += "<div class=\"table-body-cell\">" + (row.entryCount || 0) + "</div>\n";
            htmlOutput += "<div class=\"table-body-cell\">" + (row.lastEntryDate || '-') + "</div>\n";
            if(canEdit(request))
            {
                htmlOutput += "<div class=\"table-body-cell\"><a href=\"http://localhost:3000/api/editresearchobject/" + row.id + "\" style=\"color:#336699;text-decoration:none;\">E</a></div>\n";
                htmlOutput += "<div class=\"table-body-cell\"><a href=\"http://localhost:3000/api/deleteresearchobject/" + row.id + "\" style=\"color:#336699;text-decoration:none;\">D</a></div>\n";
            }
            htmlOutput += "</div>\n";
        }
          

        htmlOutput += "</div></div>\n\n";
        response.write(htmlOutput); // Skriv ut XML-datat
        response.write(htmlInfoStop);
        response.write(htmlBottom);
        response.end();
    }
    sqlQuery();
});

// add toggle
router.get('/toggle/:id', async function(request, response)
{
    const id = request.params.id;
    const level = (request.session.securityaccesslevel || '').trim().toUpperCase();

    if(level !== 'A')
    {
        response.write(htmlHead);
        response.write(htmlHeader);
        response.write(htmlMenu);
        response.write(htmlInfoStart);
        response.write("You are not authorised to do this.");
        response.write(htmlInfoStop);
        response.write(htmlBottom);
        response.end();
        return;
    }

    const ADODB = require('node-adodb');
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb;');

    const result = await connection.query("SELECT objectStatus FROM ResearchObjects WHERE id=" + id);
    if(result.length > 0)
    {
        const newStatus = (result[0].objectStatus === 'open') ? 'archive' : 'open';
        await connection.execute("UPDATE ResearchObjects SET objectStatus='" + newStatus + "' WHERE id=" + id);
    }
    response.redirect('http://localhost:3000/api/virusdatabase/' + id);
});


// --------------------- List a specifik virus, Metod 4: Databas -----------------------------

router.get('/:id', (request, response) =>
{
    var ID = request.params.id;
    
    // Öppna databasen
    const ADODB = require('node-adodb');
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb;');

    async function sqlQuery()
    {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(htmlHead);
        if(request.session.loggedin)
        {
            htmlLoggedinMenuCSS = readHTML('./master-frame/loggedinmenu_css.html');
            response.write(htmlLoggedinMenuCSS);
            htmlLoggedinMenuJS = readHTML('./master-frame/loggedinmenu_js.html');
            response.write(htmlLoggedinMenuJS);
            //htmlLoggedinMenu = readHTML('./masterframe/loggedinmenu.html');
            //response.write(htmlLoggedinMenu);
            response.write(pug_loggedinmenu({
                employeecode: request.cookies.employeecode,
                name: request.cookies.name,
                logintimes: request.cookies.logintimes,
                lastlogin: request.cookies.lastlogin,
              }));
        }
        response.write(htmlHeader);
        response.write(htmlMenu);
        response.write(htmlInfoStart);

        // Skicka SQL-query till databasen och läs in variabler
        const result = await connection.query("SELECT ID, objectNumber, objectName, objectCreator, objectCreatedDate, objectCreatedTime, objectText, objectStatus, presentationVideoLink, securityVideoLink FROM ResearchObjects WHERE [ID]=" + ID );
        str_id = result[0]['ID'];
        str_objectNumber = result[0]['objectNumber'];
        str_objectName = result[0]['objectName'];
        str_objectCreator = result[0]['objectCreator'];
        str_objectCreatedDate = result[0]['objectCreatedDate'];
        str_objectCreatedTime = result[0]['objectCreatedTime'];
        str_objectText = result[0]['objectText'];
        str_objectStatus = result[0]['objectStatus'];
        str_presentationVideoLink = result[0]['presentationVideoLink'];
        str_securityVideoLink = result[0]['securityVideoLink'];

        // fetch and calculate size and date edited of the pdf from safetydatasheets
        const pdfPath = './data/safetydatasheets/' + str_objectNumber + '.pdf';
        let pdfSize = 'N/A';
        let pdfDate = 'N/A';

        if(fs.existsSync(pdfPath))
        {
            const stats = fs.statSync(pdfPath);
            pdfSize = Math.round(stats.size / 1024) + ' KB';
            const d = new Date(stats.mtime);
            pdfDate = d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear();
        }

        const level = (request.session.securityaccesslevel || '').trim().toUpperCase();
        const btnText = (str_objectStatus === 'open') ? 'Archive Object' : 'Open Object';
        const toggleUrl = (level === 'A')
        ? 'http://localhost:3000/api/virusdatabase/toggle/' + str_id
        : 'javascript:alert(\'Access denied. Incorrect permissions.\');';

        let htmlOutput = "" +
        "<link rel=\"stylesheet\" href=\"css/virusinfo.css\" \/>" +
        "<link rel=\"stylesheet\" href=\"css/index.css\" \/>" +
        "<div class=\"virusbox\">" +

        // Header table
        "<div style=\"display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 10px; padding-top: 20px;\">" +
        "<font size=\"5\"><b><font style=\"color: #000000\">" + str_objectNumber + "</font></b> " + str_objectName + "</font>" +
        "<font size=\"2\" style=\"color: #555555; text-align: right; white-space: nowrap;\">Created: " + str_objectCreatedDate + "<br>By: " + str_objectCreator + "</font>" +
        "</div>" +

        // Text box
        "<table class=\"virusinfo\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #97caf1;\">" +
        "<tr><td><font size=\"2\"> " + str_objectText + "</font></td></tr>" +
        "</table>" +

        // Button
        "<div>" +
        "<input type=\"button\" class=\"editbutton\" value=\"Edit Info\" onclick=\"window.location.href='http://localhost:3000/api/editresearchobject/" + str_id + "'\" />" +
        "<input type=\"button\" class=\"openbutton\" value=\"" + btnText + "\" onclick=\"window.location.href='" + toggleUrl + "'\" />" +
        "</div>" +

        // File rows table
        "<table border=\"0\" cellpadding=\"8\" cellspacing=\"0\" style=\"width: 100%; border-collapse: collapse; margin-top: 10px; padding-bottom: 15px;\">" +

        // Row 1 - PDF file
        "<tr>" +
        "<td style=\"padding: 10px 16px;\"><b>Security data sheet:</b></td>" +
        "<td style=\"padding: 10px 16px;\"><a href=\"/data/safetydatasheets/" + str_objectNumber + ".pdf\" style=\"color: #000000;\">" + str_objectNumber + ".pdf</a></td>" +
        "<td style=\"padding: 10px 16px;\">"+pdfSize+"</td>" +
        "<td style=\"padding: 10px 16px;\">"+pdfDate+"</td>" +
        (canEdit(request) ? 
            "<td style=\"padding: 10px 16px; text-align:center;\"><a href=\"http://localhost:3000/api/editresearchobject/" + str_id + "\" style=\"color:green;\">Edit</a></td>" +
            "<td style=\"padding: 10px 16px; text-align:center;\"><a href=\"http://localhost:3000/api/deleteresearchobject/" + str_id + "\" style=\"color:red;\">Delete</a></td>" 
            : "") +
        "</tr>" +

        // Row 2 - Presentation video
        "<tr>" +
        "<td style=\"padding: 10px 16px;\"><b>Security Presentation Video:</b></td>" +
        "<td style=\"padding: 10px 16px;\"><a href=\"" + str_presentationVideoLink + "\" style=\"color:#000000;\">" + str_presentationVideoLink + "</a></td>" +
        "<td style=\"padding: 10px 16px;\"></td><td style=\"padding: 10px 16px;\"></td>" +
        (canEdit(request) ? "<td style=\"padding: 10px 16px; text-align:center;\"><a href=\"http://localhost:3000/api/editresearchobject/" + str_id + "\" style=\"color:green;\">Edit</a></td>" : "")+
        "</tr>" +

        // Row 3 - Handling video
        "<tr>" +
        "<td style=\"padding: 10px 16px;\"><b>Security Handling Video:</b></td>" +
        "<td style=\"padding: 10px 16px;\"><a href=\"" + str_securityVideoLink + "\" style=\"color:#000000;\">" + str_securityVideoLink + "</a></td>" +
        "<td style=\"padding: 10px 16px;\"></td><td style=\"padding: 10px 16px;\"></td>" +
        (canEdit(request) ? "<td style=\"padding: 10px 16px; text-align:center;\"><a href=\"http://localhost:3000/api/editresearchobject/" + str_id + "\" style=\"color:green;\">Edit</a></td>" : "")+
        "</tr>" +

        "</table>"
        
        "</table>" +
        "</div>" +
        "</td></tr>" +
        "</table>";    
      


    response.write(htmlOutput);

    // entry handling
    entriesCSS = readHTML('./master-frame/researchentries_css.html')
    response.write(entriesCSS)
    entriesJS = readHTML('./master-frame/researchentries_js.html')
    response.write(entriesJS)
    entriesHTML = readHTML('./master-frame/researchentries.html')
    response.write(entriesHTML)

    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();
    }
    sqlQuery();
});

module.exports = router;
