define(['./common'], function (common) {

	/*-------------------- MAIN FUNCTIONS --------------------*/

	var appendNavBar = function(){
		var ul = $('<ul></ul>');
		for(var i = 65; i <= 90; i++){
			var letter = String.fromCharCode(i);
			var li = $('<li><a class="letter-bt" href="#' + letter + '">' + letter  +'</a></li>');
			$(ul).append(li);
		}
		$('nav').append(ul);

		attachEvents();
	}

	var loadData = function(letter){

		console.log('Calling loadData.');
		console.log('Requesting: letter ' + letter + '.');

    	// Don't make a new request until it gets a response from the server
    	disableNavigation();
    	removeSelectedLetter();
    	highlightSelectedLetter();
		$('#container').remove();
		var container = $('<div id="container"></div>');
		$('body').append(container);  	
		common.appendLoader(container);

		$.post('/letter', {
			letter: letter
		}, function(response) {
	        // console.log(response);
	        if(response.error){
	        	throw response.error

	        // Loaded results
	        }else{
	        	console.log('Got response from server.');
	        	// console.log(response);
	        	console.log('Got ' + response['results'].length + ' total objects.');

				enableNavigation();
				$(container).empty();
	        	processData(response, container);
	        }
	    });
	}

	var processData = function(data, container){

		console.log('Called processData.');
		data['results'] = common.refineDates(data['results']);

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
    			languages: [],	// All languages
    			rankings: [],	// All ranking positions
    			dates: []		// All dates
    		}

    		for(var j in sortedData[i]){
    			// console.log(sortedData[i][j]);
    			var language = sortedData[i][j]['language_name'];
    			var ranking = sortedData[i][j]['ranking'];
    			var date = sortedData[i][j]['date'];
    			
    			if(thisQuery['languages'].indexOf(language) < 0){
    				thisQuery['languages'].push(language);
    			}
    			if(thisQuery['rankings'].indexOf(ranking) < 0){
    				thisQuery['rankings'].push(ranking);
    			}
    			if(thisQuery['dates'].indexOf(date) < 0){
    				thisQuery['dates'].push(date);
    			}

    			// Storing images and youtube videos
    			if(sortedData[i][j]['service'] == 'images'){
    				thisQuery['url'] = sortedData[i][j]['url'];	
    			}else if(sortedData[i][j]['service'] == 'youtube'){
					thisQuery['videoId'] = sortedData[i][j]['videoId'];
	    			thisQuery['thumbnail'] = sortedData[i][j]['thumbnail'];
    			}
    		}
    		thisQuery['languages'] = _.sortBy(thisQuery['languages'], function(item, index, array){
    			return item;
    		});
    		thisQuery['rankings'] = _.sortBy(thisQuery['rankings'], function(item, index, array){
    			return item;
    		});
    		thisQuery['dates'] = _.sortBy(thisQuery['dates'], function(item, index, array){
    			return item;
    		});
    		console.log(thisQuery);
    		// console.log(thisQuery['languages']);
    		groupedQueries.push(thisQuery);
    	}
    	// console.log(groupedQueries);

    	appendResults(groupedQueries, container);
	}

	var appendResults = function(data, container){
		
		console.log('Appending results...');

		for(var index in data){
				
			var itemContainer = $('<div class="item"></div>');				

			// YOUTUBE
			if(data[index]['service'] == 'youtube'){

				var itemContent = $('<div class="content" ' +
									'style="background-image: url(' + data[index]['thumbnail'] + ')" ' +
									'videoid="' + data[index]['videoId'] + '">' +
									'<img src="/assets/img/play.png"/>' +
									'</div>');
			// GOOGLE IMAGES
			}else if(data[index]['service'] == 'images'){

				var itemContent = $('<div class="content">' +
									'<img src="' + data[index]['url'] + '" />' +
									'</div>');
			// GOOGLE WEB
			}else{

				var itemContent = $('<div class="content"><h1>' + data[index]['query'] + '</h1></div>');
			}
			$(itemContent).addClass(data[index]['service']);

			// DESCRIPTION
			var itemDescription = $('<div class="description" style="display:none"></div>');

				// Query
				if(data[index]['service'] != 'web'){
					$(itemDescription).append('<h2>' + data[index]['query'].toUpperCase() + '</h2>');
				}

				// Service
				$(itemDescription).append('<h3>' + servicesAlias[data[index]['service']] + '</h3>')
								  .append('<hr/>');

				// Languages
				var languagesText = 'Appears in ';
				for(var i in data[index]['languages']){
					if(i > 0){
						if(data[index]['languages'].length > 2){
							languagesText += ', ';
						}
		    			if(i == data[index]['languages'].length - 1){
		    				if(data[index]['languages'].length == 2){
		    					languagesText += ' ';
		    				}
		    				languagesText += 'and ';
		    			}						
					}
	    			languagesText += '<b>' + data[index]['languages'][i] + '</b>';
				}
				$(itemDescription).append('<p>' + languagesText + '</p>');

				// Dates
				var datesText = 'From <b>' +
									common.formatDateMMDDYYY(data[index]['dates'][0]) +
									'</b> to <b>' +
									common.formatDateMMDDYYY(data[index]['dates'][data[index]['dates'].length - 1])  + '</b>';
				$(itemDescription).append('<p>' + datesText + '</p>');

				// More info
				// $(itemDescription).append('<a href="query.html#' + encodeURIComponent(data[index]['query']) + '?' + data[index]['service'] + '">More Info</a>');
				$(itemDescription).append('<a href="query.html?query=' + encodeURIComponent(data[index]['query']) + '&service=' + data[index]['service'] + '">More Info</a>');
			
			$(itemDescription).addClass(data[index]['service']);

			$(container).append(itemContainer);
			$(itemContainer).append(itemContent)
							.append(itemDescription);
		}

		drawLayout(container);		
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

	/*-------------------- AUX FUNCTIONS ---------------------*/

	var attachEvents = function(){
		// Play video
		$('.content.youtube').off('click').on('click', function(){
			console.log($(this).attr('videoid'));
			$(this).html(embedYoutube($(this).attr('videoid')));
		});

		// Hash router
	    $(window).off('hashchange').on('hashchange', function() {
	        loadData(location.hash.substring(1, location.hash.length));
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

	var removeSelectedLetter = function(){
		console.log('Called removeSelectedLetter.');
		$('nav').find('a.letter-bt').removeClass('selected');
	}

	var highlightSelectedLetter = function(){
		console.log('Called highlightSelectedLetter.');
		$('nav').find('a.letter-bt').each(function(index, item){
			if(location.hash.substring(1, location.hash.length) == $(item).html()){
				$(item).addClass('selected');
			}
		});
	}

	var disableNavigation = function(){
		console.log('Called disableNavigation.');
		$('nav').find('a.letter-bt').addClass('not-active');
	}

	var enableNavigation = function(){
		console.log('Called enableNavigation.');
		$('nav').find('a.letter-bt').removeClass('not-active');
	}

	var embedYoutube = function(id){
		var iframe = '<iframe src="https://www.youtube.com/embed/' +
					 id +		
					 '?autoplay=1&controls=0" frameborder="0" allowfullscreen></iframe>';
		return iframe;
	}

	/*-------------------- APP INIT ---------------------*/

	// GLOBAL VARS
	var servicesAlias = {
		web: 'Google Web',
		images: 'Google Images',
		youtube: 'Youtube'
	}

	appendNavBar();
	loadData(location.hash.substring(1, location.hash.length));
});

/*-------------------- DEPRECATED ---------------------*/

// Infinite scroll
// $(window).scroll(function()	{
//     if($(window).scrollTop() == $(document).height() - $(window).height()) {
//         loadData(location.hash.substring(1, location.hash.length));
//     }
// });