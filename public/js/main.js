/* Your code starts here */

var app = {};

app.init = function() {

	var convertToServerTimeZone = function(date){
	    //EST
	    var localToUtcOffsetMin = new Date().getTimezoneOffset();
	    var localToUtcOffsetMillis = localToUtcOffsetMin * 60000;
	    var clientDateMillis = Date.parse(new Date(date));
	    var serverDateMillis = clientDateMillis + localToUtcOffsetMillis;
	    return serverDateMillis;
	    // offset = -5.0
	    // clientDate = new Date(date);
	    // utc = clientDate.getTime() + (clientDate.getTimezoneOffset() * 60000);
	    // serverDate = new Date(utc + (3600000*offset));
	    // console.log(serverDate.toLocaleString());
	};

	var loadData = function(){

		var startDate = new Date(2015, 02, 24);
		console.log(startDate.getTime());
		// console.log(startDate.getHours());
		// startDate = convertToServerTimeZone(startDate);
		// console.log(startDate.getHours());

		$.post('/start', {
			date: startDate.getTime()
		}, function(response) {
	        // console.log(response);
	        if(response.error){
	        	throw response.error	
	        }else{
	        	console.log(response);
	        }
	    });				
	}

	loadData();

	var obj = {
	    videoId: 'jtDnmVjPfvM',
	    thumbnail: 'https://i.ytimg.com/vi/jtDnmVjPfvM/hqdefault.jpg'
	};

	$('body').append('<iframe width="560" height="315" src="https://www.youtube.com/embed/' + obj['videoId'] + '" frameborder="0" allowfullscreen></iframe>')
};

app.init();