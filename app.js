var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

var config = require('./config/config');

var index = require('./routes/index');
var users = require('./routes/users');
var friends = require('./routes/friends');
var follows = require('./routes/follows');
var blocks = require('./routes/blocks');
var posts = require('./routes/posts');

var app = express();

// Connect to database
mongoose.Promise = require('bluebird');
mongoose.connect(config.database.local,{
  useMongoClient: true,
  /* other options */
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Init passport
app.use(passport.initialize());
require('./config/passport')(passport);

// Routes
app.use('/', index);
app.use('/users', users);
app.use('/friends', friends);
app.use('/follows', follows);
app.use('/blocks', blocks);
app.use('/posts', posts);

// swagger doc
var showExplorer = true;
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, showExplorer));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
