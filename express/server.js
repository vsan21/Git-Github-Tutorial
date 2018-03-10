var express = require('express');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var path = require('path');
var expressValidator = require('express-validator');
// var mongodb = require('mongodb');
var mongojs = require('mongojs');
// var db = mongojs('express', ['newUsers']);

var db = mongojs('git_project', ['newUsers']);

var server = express();

var urlencodedParser = bodyParser.urlencoded({ extended: false })

//View Engine
server.set('view engine', 'ejs');
server.set('views', path.join(__dirname, 'views'));
server.use(express.static(path.join(__dirname, 'public')));

//Global Vars
server.use(function(req, res, next) {
  res.locals.errors = null;
  next();
})

//Body Parser Middleware
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: false}));

//Express Validator Middleware
server.use(expressValidator());

server.get('/', function(req, res) {
  db.users.find(function (err, docs) {
     res.render('index', {
       title: 'HomePage',
       users: docs
     });
  })
});

server.get('/index', function (req, res) {
 res.render('index', {
   title: 'Homepage'
 });
});

server.get('/solo', function (req, res) {
 res.render('solo', {
   title: 'Git Solo'
 });
});

server.get('/group', function (req, res) {
 res.render('group', {
   title: 'Git Group'
 });
});

server.get('/forking', function (req, res) {
 res.render('forking', {
   title: 'Git Forking Collaboration'
 });
});

server.post('/url', function(req, res){

  req.checkBody('name', 'Name is Required').notEmpty();
  req.checkBody('email', 'Email is Required').notEmpty();

  var errors = req.validationErrors();

  if(errors) {
    res.render('index', {
      errors: errors
    })
  } else {
    var newUser = {
      name: req.body.name,
      email: req.body.email
    };
    db.newUsers.insert(newUser, function(err, result) {
      if(err) {
        console.log(err);
      }
      res.redirect('/');
    });
  }


  const output = `
    <p>Here's the link to the resources doc you requested! <p>
    <a href="https://docs.google.com/document/d/1XDDsqAiT0WRTMoESiidBEgR_niBPyZJWWudoSTpJRtc/edit?usp=sharing">Resource Link</a>
    `;

// create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'fake23480@gmail.com', // generated ethereal user
            pass: 'fakegmail' // generated ethereal password
        },

        tls: {
          rejectUnauthorized: false
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Fake Person 👻" <fake23480@gmail.com>', // sender address
        to: req.body.email, // list of receivers
        subject: 'Hello Person', // Subject line
        text: 'Hello world?', // plain text body
        html: output // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.render('index', {msg: 'Email has been sent!'});

    });
  });

server.listen(3000, function(){
  console.log('Server Started on Port 3000....')
});
