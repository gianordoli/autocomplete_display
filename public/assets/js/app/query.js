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

	        	processData(response);
	        }
	    });
	}

	var processData = function(data){
		var groupedByDate = _.groupBy(data['results'], function(item, index, array){
			// console.log(item);
			return item['date'];
		});
		// console.log(groupedByDate);
		appendResults(data['main'], groupedByDate);
	}

	var appendResults = function(main, data){

		console.log('Appending results...');
		// console.log(main);
				
		var mainContainer = $('<div class="main ' + main['service'] + '"></div>');

		// YOUTUBE
		if(main['service'] == 'youtube'){

			var mainContent = $('<div class="content" ' +
								'style="background-image: url(' + main['thumbnail'] + ')" ' +
								'videoid="' + main['videoId'] + '">' +
								'<img src="/assets/img/play.png"/>' +
								'</div>');
		// GOOGLE IMAGES
		}else if(main['service'] == 'images'){

			var mainContent = $('<div class="content">' +
								'<img src="' + main['url'] + '" />' +
								'</div>');
		// GOOGLE WEB
		}else{

			var mainContent = $('<div class="content"><h1>' + main['query'] + '</h1></div>');
		}

		$('#container').append(mainContainer);
		$(mainContainer).append(mainContent);

		// DESCRIPTION
		// var itemDescription = $('<div class="description" style="display:none"><div>');

		// 	// Query
		// 	if(main['service'] != 'web'){
		// 		$(itemDescription).append('<h2>' + main['query'] + '</h2>');
		// 	}

		// var item

		// for(var i in data){
		// 	var dateContainer = $()
		// }
		
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