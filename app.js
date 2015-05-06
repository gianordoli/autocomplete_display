/*-------------------- MODULES --------------------*/
var		express = require('express'),			  // Run server
	 bodyParser = require('body-parser'),		  // Parse requests
	MongoClient = require('mongodb').MongoClient, // Access database
			  _ = require('underscore'),  		  // Filtering/sorting
         google = require('googleapis');          // Url shortener             
        // request = require('request');

/*-------------------- SETUP --------------------*/
var app = express();
// .use is a middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());
app.use(function(req, res, next) {
    // Setup a Cross Origin Resource sharing
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('incoming request from ---> ' + ip);
    // Show the target URL that the user just hit
    var url = req.originalUrl;
    console.log('### requesting ---> ' + url);
    next();
});

app.use('/', express.static(__dirname + '/public'));
/*-----------------------------------------------*/


var imagesInDB = [];
var youtubeInDB = [];

function init(){
    MongoClient.connect('mongodb://127.0.0.1:27017/thesis', function(err, db) {
        loadImages(db, function(data){
            
            imagesInDB = data;

            loadYoutube(db, function(data){
                
                youtubeInDB = data;

            });

        });
    });    
}

function loadImages(db, callback){

    console.log('Called loadImages.');

    // var imagesCollection = db.collection('images');
    var imagesCollection = db.collection('images');

    imagesCollection.find({}).toArray(function(err, results) {            
        console.log('Found ' + results.length + ' images.');
        callback(results);
    });
}

function loadYoutube(db, callback){
    
    console.log('Called loadYoutube.');

    var youtubeCollection = db.collection('youtube');

    youtubeCollection.find({}).toArray(function(err, results) {            
        console.log('Found ' + results.length + ' videos.');
        callback(results);
        db.close(); // Let's close the db 
    });
}

app.post('/letter', function(request, response) {
    console.log(request.body['letter']);
    
    // console.log(request.body['date']);
    // var date1 = new Date(parseInt(request.body['date']) - 86400000);
    // var date2 = new Date(parseInt(request.body['date']));
    // console.log(date1.getFullYear() + '/' + date1.getMonth() + '/' + date1.getDate() + ' - ' + date1.getHours() + ':' + date1.getMinutes() + ':' + date1.getSeconds());
    // console.log(date2.getFullYear() + '/' + date2.getMonth() + '/' + date2.getDate() + ' - ' + date2.getHours() + ':' + date2.getMinutes() + ':' + date2.getSeconds());

    MongoClient.connect('mongodb://127.0.0.1:27017/thesis', function(err, db) {
        
        console.log('Connecting to DB...');
        
        if(err) throw err;
        
        console.log('Connected.');

        var recordsCollection = db.collection('records');

        recordsCollection.find({
            // 'date': { '$gt': date1, '$lte': date2 },
            // 'service': 'youtube',
            // 'language_code': 'pt-BR',
            '$or': [{'language_code': 'da'}, {'language_code': 'de'}, {'language_code': 'en'}, {'language_code': 'es'}, {'language_code': 'fi'}, {'language_code': 'fr'}, {'language_code': 'hu'}, {'language_code': 'id'}, {'language_code': 'is'}, {'language_code': 'it'}, {'language_code': 'nl'}, {'language_code': 'nl'}, {'language_code': 'pt-BR'}, {'language_code': 'no'}],
            'letter': request.body['letter'].toLowerCase()

        }).toArray(function(err, results) {
            // console.dir(results);
            console.log('Found ' + results.length + ' results.');

            results = getUrls(results);

            console.log('Sending back results.');
            // console.log(date2);
            console.log(results.length);
            response.json({
                // date: date2,
                results: results
            });

            db.close(); // Let's close the db 
        });         
    });
});

app.post('/query', function(request, response) {

    console.log('Query: ' + request.body['query']);
    console.log('Service: ' + request.body['service']);

    MongoClient.connect('mongodb://127.0.0.1:27017/thesis', function(err, db) {
        
        console.log('Connecting to DB...');
        
        if(err) throw err;
        
        console.log('Connected.');

        var recordsCollection = db.collection('records');

        recordsCollection.find({
            query: request.body['query'],
            service: request.body['service'],
            '$or': [{'language_code': 'da'}, {'language_code': 'de'}, {'language_code': 'en'}, {'language_code': 'es'}, {'language_code': 'fi'}, {'language_code': 'fr'}, {'language_code': 'hu'}, {'language_code': 'id'}, {'language_code': 'is'}, {'language_code': 'it'}, {'language_code': 'nl'}, {'language_code': 'nl'}, {'language_code': 'pt-BR'}, {'language_code': 'no'}]

        }).toArray(function(err, results) {
            // console.dir(results);
            console.log('Found ' + results.length + ' results.');

            console.log('Sending back results.');

            var main = getUrls(results.slice(0, 1))[0];
            // console.log(main);

            response.json({
                main: main,
                results: results
            });

            db.close(); // Let's close the db 
        });         
    });
});

var getUrls = function(data){

    console.log('Calling getUrls.');

    // Getting youtube and images url from the other DBs
    for(var i = 0; i < data.length; i++){
        
        // console.log(data[i]['service']);

        if(data[i]['service'] == 'images'){
            // console.log(data[i]['query']);
            var record = _.find(imagesInDB, function(item, index, list){
                // console.log(item['query']);
                return item['query'] == data[i]['query'];
            });
            // console.log(data[i]['query']);
            // console.log(record);
            data[i]['url'] = record['url'];
            // console.log(data[i]);

        }else if(data[i]['service'] == 'youtube'){
            // console.log(data[i]['query']);
            var record = _.find(youtubeInDB, function(item, index, list){
                // console.log(item);
                // console.log(item['query']);
                return item['query'] == data[i]['query'];
            });
            // console.log(data[i]['query']);
            // console.log(record);
            data[i]['videoId'] = record['videoId'];
            data[i]['thumbnail'] = record['thumbnail'];
            // console.log(results[i]);
        }
    }

    console.log('Grabbed image and youtube urls.');

    return data;
}

app.post('/about', function(request, response) {

    var date1 = new Date(1424476800000);
    var date2 = new Date(1424476800000 + 86400000);

    MongoClient.connect('mongodb://127.0.0.1:27017/thesis', function(err, db) {
        
        console.log('Connecting to DB...');
        
        if(err) throw err;
        
        console.log('Connected.');

        var recordsCollection = db.collection('records');

        recordsCollection.find({
            'date': { '$gt': date1, '$lte': date2 },
            'language_code': 'en'

        }).toArray(function(err, results) {
            // console.dir(results);
            console.log('Found ' + results.length + ' results.');

            console.log('Sending back results.');
            response.json({
                results: results
            });

            db.close(); // Let's close the db 
        });         
    });
});

app.post('/shorten', function(request, response) {
    console.log('Calling url shortener.');
    console.log(request['body']['url']);

    var urlshortener = google.urlshortener('v1');
    var API_KEY = 'AIzaSyB9D0EtnMKVsZJJrpdE2Yw-8dcV0e3OpPE';

    var params = {
        auth: API_KEY,
        resource: {
            longUrl: request['body']['url']
        }
    };

    urlshortener.url.insert(params, function (err, resp) {
        if (err) {
            console.log('Encountered error', err);
        } else {
            console.log(resp);
            console.log('Short url is', resp.id);
            response.json(resp.id);
        }
    });    


});

/*----------------- INIT SERVER -----------------*/
var PORT = 3000; //the port you want to use
app.listen(PORT, function() {
    console.log('Server running at port ' + PORT + '. Ctrl+C to terminate.');
});

init();