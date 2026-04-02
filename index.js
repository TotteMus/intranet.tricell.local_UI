/* ----------------------------- 3:rd party-moduler ------------------------------ */
const config = require('./config/globals.json');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();                  /* Skapa webbserver-objektet */
app.use(express.static('./public'));    /* Skapa global path till "public"-mappen */

var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(
    session({
    secret: 'thisisasecret',
    saveUninitialized: true,
    resave: false
    }));

app.use(bodyParser.json());
app.use(
bodyParser.urlencoded({
extended: true
}));

const pug = require('pug');
const { response } = require('express');
const pug_loggedinmenu = pug.compileFile('./master-frame/loggedinmenu.html');


/* ------------------------------ Egna moduler ----------------------------------- */
const readHTML = require('./readHTML.js');
// magnami const fileUploadRouter = require('./router/filuploadvirus.js');

    /* Läs respektive HTML-text-sida för Masterframen */
    var htmlHead = readHTML('./master-frame/head.html');
    var htmlHeader = readHTML('./master-frame/header.html');
    var htmlMenu = readHTML('./master-frame/menu.html');
    var htmlInfoStart = readHTML('./master-frame/infoStart.html');
    var htmlIndex = readHTML('./public/text/index.html');
    var htmlInfoStop = readHTML('./master-frame/infoStop.html');
    var htmlBottom = readHTML('./master-frame/bottom.html');


/* ------------- Skapa routes för de alternativa rutterna i webbapplikationen ------------------------- */

const info = require('./routes/info');
const personnelregistry = require('./routes/personnelRegistry');
const login = require('./routes/login');
const logout = require('./routes/logout');
const virusdatabase = require('./routes/virusdatabase');
const newResearchObject = require('./routes/newresearchobject');
const editResearchObject = require('./routes/editresearchobject');
const deleteResearchObject = require('./routes/deleteresearchobject');
const newemployee = require('./routes/newemployee');
const deleteemployee = require('./routes/deleteemployee');
const editemployee = require('./routes/editemployee');
const getchat = require('./routes/getchat');
const chat = require('./routes/chat');
const activityLog = require('./routes/activityLog');
const livestream = require('./routes/livestream.js');
const editvirusimage = require('./routes/editvirusimage');
const entries = require('./routes/entries');
const panic = require('./routes/panic');
const userdatabase = require('./routes/userdatabase');
const fileUploadRouter = require('./routes/fileuploadvirus.js');


/* -------------- Skapa default-router (om ingen under-sökväg anges av användaren) --------------------- */
app.get('/', function(request, response)
{
    const infotext = request.params.infotext;
    
    response.setHeader('Content-type','text/html');
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
    htmlInfo = readHTML('./public/text/index.html');
    response.write(htmlInfo);    
    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();
});


app.use('/api/info', info);
app.use('/api/personnelregistry', personnelregistry);
app.use('/api/login', login);
app.use('/api/logout', logout);
app.use('/api/virusdatabase', virusdatabase);
app.use('/api/newresearchobject', newResearchObject);
app.use('/api/editresearchobject', editResearchObject);
app.use('/api/deleteresearchobject', deleteResearchObject);
app.use('/api/newemployee', newemployee);
app.use('/api/deleteemployee', deleteemployee);
app.use('/api/editemployee', editemployee);
app.use('/api/getchat', getchat);
app.use('/api/chat', chat);
app.use('/api/activitylog', activityLog);
// magnami app.use('/api/data', fileUploadRouter);
app.use('/api/livestream', livestream);
app.use('/api/editvirusimage', editvirusimage);
app.use('/api/entries', entries);
app.use('/api/panic', panic);
app.use('/api/userdatabase', userdatabase);
app.use('/api/data', fileUploadRouter);


/* ---------------------------------- Starta webbservern ------------------------------ */
const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log(`Listening on port ${port}... `));