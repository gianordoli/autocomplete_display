/* Your code starts here */

var app = {};

app.init = function() {

	var appendNavBar = function(){
		var ul = $('<ul></ul>');
		for(var i = 65; i <= 90; i++){
			var letter = String.fromCharCode(i);
			var li = $('<li><a class="letter-bt" href="#' + letter + '">' + letter  +'</a>');
			$(ul).append(li);
		}
		$('nav').append(ul);

		attachEvents();
	}

	var loadData = function(query){

		console.log('Calling loadData.')
		console.log('Requesting: ' + query + '.');

		$.post('/query', {
			query: query
		}, function(response) {
	        // console.log(response);
	        if(response.error){
	        	throw response.error

	        // Loaded results
	        }else{
	        	console.log('Got response from server.');
	        	console.log(response);

	        }
	    });
	}

	var processData = function(data){

	}

	var appendResults = function(data){
		
	}

	var attachEvents = function(){

	}

	// GLOBAL VARS
	var servicesAlias = {
		web: 'Google Web',
		images: 'Google Images',
		youtube: 'Youtube'
	}

	loadData(location.hash.substring(1, location.hash.length));	
};

app.init();