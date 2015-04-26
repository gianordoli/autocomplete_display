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

		console.log('Calling loadData.')

		// Don't make a new request until it gets a response from the server
		if(!isLoadingData){

			console.log('Requesting: letter ' + letter + ', date: ' + new Date(currDate));

			isLoadingData = true;
			appendLoader();

			// Date
			var prevDate = currDate - oneDayInMillis;

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

		}else{
			console.log('>>> Request already in progress.')
		}
	}

	var processData = function(data){

    	var clusteredData = _.groupBy(data['results'], function(item, index, list){
    		// console.log(item['query']);
    		return item['query'] + '#' + item['service'];
    	});
    	// console.log(clusteredData);
    	console.log('Clustering to ' + Object.keys(clusteredData).length + ' query#service objects.');	      

    	var sortedData = _.sortBy(clusteredData, function(value, key, collection){
    		// console.log(key.substring(0, key.indexOf('#')));
    		return key.substring(0, key.indexOf('#'));
    	});
    	// console.log(sortedData);
    	// clusteredData = _.shuffle(clusteredData);
    	// clusteredData = _.sample(clusteredData, 50);

    	var groupedQueries = [];

    	for(var i in sortedData){
    		// console.log(sortedData[i]);
    		var thisQuery = {
    			query: sortedData[i][0]['query'],
    			service: sortedData[i][0]['service'],
    			languages: [],	// key-value pairs with language and ranking
    		}

    		for(var j in sortedData[i]){
    			// console.log(sortedData[i][j]);
    			var language = sortedData[i][j]['language_name'];
    			var ranking = sortedData[i][j]['ranking'];
    			
    			// Creating the array of {language: ranking}
    			var thisLanguage = {};
    			thisLanguage[language] = ranking;
    			thisQuery['languages'].push(thisLanguage);

    			// Storing images and youtube videos
    			if(sortedData[i][j]['service'] == 'images'){
    				thisQuery['url'] = sortedData[i][j]['url'];	
    			}else if(sortedData[i][j]['service'] == 'youtube'){
					thisQuery['videoId'] = sortedData[i][j]['videoId'];
	    			thisQuery['thumbnail'] = sortedData[i][j]['thumbnail'];
    			}
    		}
    		thisQuery['languages'] = _.sortBy(thisQuery['languages'], function(item, index, array){
    			var key = Object.keys(item)[0];
    			var value = item[key];
    			// console.log(key + ': ' + value);
    			return value;
    		});
    		// console.log(thisQuery['languages']);
    		groupedQueries.push(thisQuery);
    	}
    	// console.log(groupedQueries);

    	appendResults(data['date'], groupedQueries);
	}

	var appendResults = function(date, data){
		
		console.log('Appending results...');
		
		$('#loader-container').remove();
		var dayTitle = $('<h2>' + date + '</h2>');
		var dayContainer = $('<div class="day-container"></div>');
		
		$('#container').append(dayTitle)
					   .append(dayContainer);

		for(var index in data){
				
			if(data[index]['service'] == 'youtube'){

				var itemContainer = $('<div class="item youtube"></div>');

				var itemContent = $('<div class="content" ' +
									'style="background-image: url(' + data[index]['thumbnail'] + ')" ' +
									'videoid="' + data[index]['videoId'] + '">' +
									'<img src="/assets/img/play.png"/>' +
									'</div>');
			
			}else if(data[index]['service'] == 'images'){

				var itemContainer = $('<div class="item img"></div>');

				var itemContent = $('<div class="content">' +
									'<img src="' + data[index]['url'] + '" />' +
									'</div>');
			
			}else{

				var itemContainer = $('<div class="item web"></div>');				

				var itemContent = $('<div class="content"><h1>' + data[index]['query'] + '</h1></div>');
			}

			var itemDescription = $('<div class="description" style="display:none"><div>');
				if(data[index]['service'] != 'web'){
					$(itemDescription).append('<h2>' + data[index]['query'] + '</h2>');
				}
				$(itemDescription).append('<h3>' + servicesAlias[data[index]['service']] + '</h3>');

				var itemLanguages = $('<ul></ul>')
				for(var i in data[index]['languages']){
	    			var key = Object.keys(data[index]['languages'][i])[0];
	    			var value = data[index]['languages'][i][key];
					$(itemLanguages).append('<li>' + '#' + (value + 1) + ' in ' + key + '</li>'); 
				}
				$(itemDescription).append(itemLanguages);

			$(itemContainer).append(itemContent)
							.append(itemDescription);

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
		$('.item.youtube').children('.content').off('click').on('click', function(){
			console.log($(this).attr('videoid'));
			$(this).html(embedYoutube($(this).attr('videoid')));
		});

		// Load content from letter
		$('a.letter-bt').off('click').on('click', function(){
			currDate = new Date(2015, 02, 24).getTime();			
			// loadData($(this).html());
		});

		// Has router
	    $(window).off('hashchange').on('hashchange', function() {
	        console.log('Current hash is ' + location.hash);
	        $('#container').empty();
	        loadData(location.hash.substring(1, location.hash.length));
	    });

		// Infinite scroll
		$(window).scroll(function()	{
		    if($(window).scrollTop() == $(document).height() - $(window).height()) {
		        loadData(location.hash.substring(1, location.hash.length));
		    }
		});

		// Show description
		$('.item').off('mouseenter').on('mouseenter', function(){
			$(this).css({
				'z-index': 1000
			});
			$(this).children('.description').css({
				'display': 'block'
			});
		});
		$('.item').off('mouseleave').on('mouseleave', function(){
			$(this).css({
				'z-index': 0
			});			
			$(this).children('.description').css({
				'display': 'none'
			});
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
	var oneDayInMillis = 86400000;
	var isLoadingData = false;
	var currDate = new Date(2015, 02, 24).getTime();
	var servicesAlias = {
		web: 'Google Web',
		images: 'Google Images',
		youtube: 'Youtube'
	}

	appendNavBar();
	loadData(location.hash.substring(1, location.hash.length));	
};

app.init();