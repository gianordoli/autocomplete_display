/*-------------------- MODULES --------------------*/
var		express = require('express'),			  // Run server
	 bodyParser = require('body-parser'),		  // Parse requests
	MongoClient = require('mongodb').MongoClient, // Access database
			  _ = require('underscore');		  // Filtering/sorting

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
    var imagesCollection = db.collection('images_2');

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

app.post('/start', function(request, response) {
    console.log(request.body['letter']);
    console.log(request.body['date']);

    var date1 = new Date(parseInt(request.body['date']) - 86400000);
    var date2 = new Date(parseInt(request.body['date']));

    console.log(date1.getFullYear() + '/' + date1.getMonth() + '/' + date1.getDate() + ' - ' + date1.getHours() + ':' + date1.getMinutes() + ':' + date1.getSeconds());
    console.log(date2.getFullYear() + '/' + date2.getMonth() + '/' + date2.getDate() + ' - ' + date2.getHours() + ':' + date2.getMinutes() + ':' + date2.getSeconds());

    MongoClient.connect('mongodb://127.0.0.1:27017/thesis', function(err, db) {
        
        console.log('Connecting to DB...');
        
        if(err) throw err;
        
        console.log('Connected.');

        var recordsCollection = db.collection('records');

        recordsCollection.find({
            'date': { '$gt': date1, '$lte': date2 },
            // 'language_code': 'pt-BR',
            '$or': [{'language_code': 'pt-BR'}, {'language_code': 'de'}, {'language_code': 'it'}, {'language_code': 'es'}, {'language_code': 'en'}, {'language_code': 'fr'}, {'language_code': 'es'}, {'language_code': 'en'}, {'language_code': 'da'}],
            'letter': request.body['letter'].toLowerCase()

        }).toArray(function(err, results) {
            // console.dir(results);
            console.log(results.length);

            // Getting youtube and images url from the other DBs
            for(var i = 0; i < results.length; i++){
                if(results[i]['service'] == 'images'){
                    // console.log(results[i]['query']);
                    var record = _.find(imagesInDB, function(item, index, list){
                        // console.log(item['query']);
                        return item['query'] == results[i]['query'];
                    });
                    // console.log(results[i]['query']);
                    // console.log(record);
                    results[i]['url'] = record['url'];
                    // console.log(results[i]);

                }else if(results[i]['service'] == 'youtube'){
                    // console.log(results[i]['query']);
                    var record = _.find(youtubeInDB, function(item, index, list){
                        // console.log(item);
                        // console.log(item['query']);
                        return item['query'] == results[i]['query'];
                    });
                    // console.log(results[i]['query']);
                    // console.log(record);
                    results[i]['videoId'] = record['videoId'];
                    results[i]['thumbnail'] = record['thumbnail'];
                    // console.log(results[i]);
                }
            }
            response.json(results);

            db.close(); // Let's close the db 
        });         
    });
});

/*----------------- INIT SERVER -----------------*/
var PORT = 3000; //the port you want to use
app.listen(PORT, function() {
    console.log('Server running at port ' + PORT + '. Ctrl+C to terminate.');
});

init();