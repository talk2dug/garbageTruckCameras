var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var moment = require('moment');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var geolib = require('geolib');
var GPS = require('./node_modules/gps/gps.js');
var app = express();
var GPSarray = []
var prevLAT
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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



            var gps = new GPS;
    const SerialPort = require('serialport')
    const port = new SerialPort('/dev/ttyACM0', {
        baudRate: 9600
    })
    const Readline = require('@serialport/parser-readline')
    
    // Open errors will be emitted as an error event
    port.on('error', function(err) {
      console.log('Error: ', err.message)
    })

    const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
    parser.on('data', function(data) {
        
        gps.update(data);
        //parseGPS(gps);
    })
    function calculateHeading(lon, lat) {
        var Heading = 0;
        
        Heading = GPS.Heading(prevLAT, prevLAT, lat, lon);
        Heading = Heading.toFixed(0)
        prevLAT = lat;
        prevLON = lon;
        return Heading;
    }
    gps.on('GGA', function(data) {
        
        var headingDir = calculateHeading(data.lon, data.lat)
        GPSarray['lon'] = data.lon
        GPSarray['lat'] = data.lat
        GPSarray['heading'] = headingDir
        if (gps.state.speed != null) {GPSarray['speed'] = gps.state.speed.toFixed(2)}
        if (gps.state.speed == null) {GPSarray['speed'] = 0}
            GPSarray['time'] = data.time
            if (data.lon === null) {
            var pos = {'lon': '-76.558225','lat': '38.06033333333333'}
        } else {
            var pos = {'lon': data.lon,'lat': data.lat}
        }
        console.log(data)
        
    });
module.exports = app;
