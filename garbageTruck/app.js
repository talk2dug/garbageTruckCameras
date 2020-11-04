const fs = require('fs');

var GPS = require('./node_modules/gps/gps.js');
var prevLAT;
var prevLON;
var gpsTime;
var gpsLat;
var gpsLon;
var gpsCord = "comment=lat:"+gpsLat +",lon:"+gpsLat
var moment = require('moment');
const geolib = require('geolib');
var distenceFromBase;





var record = 0;
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
  
    var timeStamp
    function calculateHeading(lon, lat) {
        var Heading = 0;
        
        Heading = GPS.Heading(prevLAT, prevLAT, lat, lon);
        Heading = Heading.toFixed(0)
        prevLAT = lat;
        prevLON = lon;
        return Heading;
    }
    gps.on('GGA', function(data) {
        gpsTime = data.time
        
         timeStamp = moment(gpsTime).format("YYYY-MM-DD-HH-mm-ss")
        var headingDir = calculateHeading(data.lon, data.lat)
        gpsLon = data.lon
        gpsLat = data.lat
        gpsHeading = headingDir
        if (gps.state.speed != null) {gpsSpeed = gps.state.speed.toFixed(2)}
        if (gps.state.speed == null) {gpsSpeed = 0}
         distenceFromBase = geolib.getDistance(
            { latitude: gpsLat, longitude: gpsLon },
            { latitude: 38.9262652, longitude: -75.6958141 },
            0.01
        )
        distenceFromBase = distenceFromBase*0.00062
        console.log(distenceFromBase)
        if(record===1){
         
         GPSData = "{'lat':"+gpsLat +",'lon':"+gpsLon +",'gpsTime':"+ timeStamp +"},\r\n"
         fs.appendFile( "../GPS.txt", GPSData, (err) => {
            if (err) console.log(err);
            console.log("Successfully Written GPS to File.");
        });  
    }  
    gpsCord = "comment={'lat':"+gpsLat +",'lon':"+gpsLon +",'gpsTime':"+ timeStamp +"}"
        });

    var spawn=require('child_process').spawn
    , child=null,
    child2=null;
    function startRecording(){
        if(record===1){
       
        fileNameTImeStamp = moment(gpsTime).format("YYYY-MM-DD-HH-mm-ss");
            name = '../videos/cam1_' + fileNameTImeStamp + ".mkv"
            
            child=spawn("ffmpeg", [
                "-r", "24",
               "-f", "v4l2", 
               
               "-video_size", "1920x1080", 
               "-input_format", 
               "mjpeg", "-i", "/dev/video0", "-metadata", gpsCord,
               "-c", "copy", "-t", "30",name
                ]);
                child.stdout.pipe(process.stdout);
                child.stderr.pipe(process.stdout);
                child.on('exit', function () {
                //console.log("exited") 
                });
                //console.log(prevLAT)
                name2 = '../videos/cam2_' + fileNameTImeStamp  + ".mkv"
            child2=spawn("ffmpeg", [
                "-r", "24",
               "-f", "v4l2", 
               
               "-video_size", "1920x1080", 
               "-input_format", 
               "mjpeg", "-i", "/dev/video2", "-metadata", gpsCord, 
               "-c", "copy", "-t", "30", name2
                ]);
                console.log(prevLAT)
                child2.stdout.pipe(process.stdout);
                child2.stderr.pipe(process.stdout);
                child2.on('exit', function () {
                console.log("exited") 
                });
            }

    }
    

    setInterval(() => {

    if(distenceFromBase<.1){
        record = 0;

        }
        else if(distenceFromBase>.1){
            record = 1;

        }
        if(record === 1){
            
        }
    }, 500);
    startRecording()
        setInterval(() => {
            
                startRecording()
                
            }, 10000);
            
 

