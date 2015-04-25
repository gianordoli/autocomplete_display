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

	var loadData = function(letter){

		// Don't make a new request until it gets a response from the server
		if(!isLoadingData){

			isLoadingData = true;
			appendLoader();

			// Date
			var prevDate = currDate - oneDayInMillis;

			// Letter
			if(letter != currLetter){
				$('#container').empty();
				currLetter = letter;
			}

			$.post('/start', {
				date: currDate,
				letter: letter
			}, function(response) {
		        // console.log(response);
		        if(response.error){
		        	throw response.error

		        // Loaded results
		        }else if(response['results'].length > 0){
		        	console.log('Got response from server.');
		        	console.log(response);
		        	console.log('Got ' + response['results'].length + ' total objects.');

    				isLoadingData = false;
    				currDate = prevDate;

		        	processData(response);

		        // Reached the first date (response.length == 0)
		        }else{

		        }
		    });
		}
	}

	var processData = function(data){

    	var clusteredData = _.groupBy(data['results'], function(item, index, list){
    		// console.log(item['query']);
    		return item['query'];
    	});
    	console.log(clusteredData);
    	console.log('Clustering to ' + Object.keys(clusteredData).length + ' unique objects.');	      

    	var sortedData = _.sortBy(clusteredData, function(value, key, collection){
    		return key;
    	});
    	console.log(sortedData);
    	// clusteredData = _.shuffle(clusteredData);
    	// clusteredData = _.sample(clusteredData, 50);

    	var groupedByService = [];

    	for(var i in sortedData){
    		// console.log(sortedData[i]);
    		var thisQuery = {
    			query: sortedData[i][0]['query'],
    			web: [],	// A key-value pair with language and ranking
    			images: [],
    			youtube: [],
    			image_url: '',
    			youtube_id: '',
    			youtube_image_url: ''
    		}

    		for(var j in sortedData[i]){
    			// console.log(sortedData[i][j]);
    			var service = sortedData[i][j]['service'];
    			var language = sortedData[i][j]['language_name'];
    			var ranking = sortedData[i][j]['ranking'];
    			
    			// Creating the array of {language: ranking}
    			var thisLanguage = {};
    			thisLanguage[language] = ranking;
    			thisQuery[service].push(thisLanguage);

    			// Storing images and youtube videos
    			if(sortedData[i][j]['service'] == 'images'){
    				thisQuery['image_url'] = sortedData[i][j]['url'];	
    			}else if(sortedData[i][j]['service'] == 'youtube'){
					thisQuery['youtube_id'] = sortedData[i][j]['videoId'];
	    			thisQuery['youtube_image_url'] = sortedData[i][j]['thumbnail'];
    			}
    		}

    		groupedByService.push(thisQuery);
    	}

    	console.log(groupedByService);

    	appendResults(data['date'], groupedByService);
	}

	var appendResults = function(date, data){
		
		console.log('Appending results...');
		
		$('#loader-container').remove();
		var dayTitle = $('<h2>' + date + '</h2>');
		var dayContainer = $('<div class="day-container"></div>');
		
		$('#container').append(dayTitle)
					   .append(dayContainer);

		for(var index in data){

			var itemContainer = $('<div class="item"><h1>' + data[index]['query'] + '</h1></div>');
			
			// WEB
			if(data[index]['web'].length > 0){
				var itemContent = $('<h2>' + data[index]['query'] + '</h2>');
				$(itemContainer).append(itemContent);
			}

			// IMAGES
			if(data[index]['images'].length > 0){
				var itemContent = $('<div class="img-container">' +
									'<img src="' + data[index]['image_url'] + '" />' +
									'</div>');
				$(itemContainer).append(itemContent);
			}

			if(data[index]['youtube'].length > 0){
				var itemContent = $('<div class="video-container" ' +
									'style="background-image: url(' + data[index]['youtube_image_url'] + ')" ' +
									'videoid="' + data[index]['youtube_id'] + '">' +
									'<img src="/assets/img/play.png"/>' +
									'</div>');
				$(itemContainer).append(itemContent);
			}			

			// data[index].forEach(function(item, index, array){
			// 	// console.log(item);	
				
			// 	if(item['service'] == 'youtube'){
			// 		var itemContent = $('<div class="video-container" ' +
			// 							'style="background-image: url(' + item['thumbnail'] + ')" ' +
			// 							'videoid="' + item['videoId'] + '">' +
			// 							'<img src="/assets/img/play.png"/>' +
			// 							'</div>');
				
			// 	}else if(item['service'] == 'images'){
			// 		var itemContent = $('<div class="img-container">' +
			// 							'<img src="' + item['url'] + '" />' +
			// 							'</div>');
				
			// 	}else{
			// 		var itemContent = $('<h2>' + item['query'] + '</h2>');
			// 	}

			// 	var itemDescription = $('<ul>' +
			// 							'<li>query: ' + item['query'] + '</li>' +
			// 							'<li>language: ' + item['language_name'] + '</li>' +
			// 							'<li>service: ' + item['service'] + '</li>' +
			// 							'<li>ranking: ' + item['ranking'] + '</li>' +
			// 							'</ul>');

			// 	$(itemContainer).append(itemContent)
			// 					.append(itemDescription);
			// });

			$(dayContainer).append(itemContainer);			
		}

		drawLayout(dayContainer);		
		attachEvents();
	}

	var drawLayout = function(parentDiv){
		console.log('Called drawLayout.');
		$container = $(parentDiv).masonry();
		// $('.item').css('visibility', 'hidden');
		// layout Masonry again after all images have loaded
		$container.imagesLoaded( function() {
			console.log('Finished loading images.');
			console.log('Calling Masonry');
			$container.masonry({
				// columnWidth: 50,
				containerStyle: null,
				itemSelector: '.item'
			});
			isMasonry = true;
		});
	}

	var attachEvents = function(){
		// Play video
		$('.video-container').off().on('click', function(){
			console.log($(this).attr('videoid'));
			$(this).html(embedYoutube($(this).attr('videoid')));
		});

		// Load content from letter
		$('a.letter-bt').off().on('click', function(){
			currDate = new Date(2015, 02, 24).getTime();			
			loadData($(this).html());
		});

		// Infinite scroll
		$(window).scroll(function()	{
		    if($(window).scrollTop() == $(document).height() - $(window).height()) {
		        loadData(currLetter);
		    }
		});		
	}

	var embedYoutube = function(id){
		var iframe = '<iframe src="https://www.youtube.com/embed/' +
					 id +		
					 '?autoplay=1&controls=0" frameborder="0" allowfullscreen></iframe>';
		return iframe;
	}

	var appendLoader = function(){
		var loaderContainer = $('<div id="loader-container"></div>')
		var loader = $('<span class="loader"></span>');

		$('#container').append(loaderContainer);
		$(loaderContainer).append(loader);
	}	

	// GLOBAL VARS
	var currLetter = 'a';
	var oneDayInMillis = 86400000;
	var isLoadingData = false;
	var currDate = new Date(2015, 02, 24).getTime();

	appendNavBar();
	loadData(currLetter);
};

app.init();