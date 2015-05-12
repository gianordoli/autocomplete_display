define(['./common', 'd3', 'twitter-widgets'], function (common) {

	/*-------------------- MAIN FUNCTIONS --------------------*/

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
    		// console.log(thisQuery);
    		// console.log(thisQuery['languages']);
    		groupedQueries.push(thisQuery);
    	}
    	// console.log(groupedQueries);

    	appendResults(groupedQueries, container);
	}

	var appendResults = function(data, container){
		
		console.log('Appending results...');

		for(var index in data){
			
			/*---------- CONTAINER ----------*/
			var itemContainer = $('<div class="item"></div>')
								.appendTo(container);

			/*----- Content -----*/
			var itemContent = $('<div class="content" query="' + data[index]['query'] + '"></div>');

			// Youtube
			if(data[index]['service'] == 'youtube'){

				var core = $('<div class="core" detail="0" style="background-image: url(' + data[index]['thumbnail'] + ')" videoid="' + data[index]['videoId'] + '">' +
								// '<img src="/assets/img/play.png"/>' +
							'</div>')
							.appendTo(itemContent);
				
				createStack(data[index]['languages'].length, itemContent, data[index]['service']);

			// Google Images
			}else if(data[index]['service'] == 'images'){

				var core = $('<img class="core" src="' + data[index]['url'] + '" />')
							.appendTo(itemContent)
							.load({
								n: data[index]['languages'].length,
								container: itemContent,
								service: data[index]['service']
							}, function(response){
								// console.log('Loaded');
								// console.log(response.data);
								createStack(response.data.n, response.data.container, response.data.service);
							});

			// Google Web
			}else{

				var el = '<h1>' + data[index]['query'] + '</h1>';
				var core = $(el)
							.addClass('core')
							.appendTo(itemContent);

				createStack(data[index]['languages'].length, itemContent, data[index]['service'], el);
			}

			$(itemContent).addClass(data[index]['service'])
			$(itemContent).children().addClass(data[index]['service']);
			$(itemContent).appendTo(itemContainer);

			/*----- Description -----*/
			var itemDescription = $('<div class="description" style="display:none"></div>');

			// Query
			if(data[index]['service'] != 'web'){
				$(itemDescription).append('<h2>' + data[index]['query'].toUpperCase() + '</h2>');
			}

			// Service
			$(itemDescription).append('<h3>' + servicesAlias[data[index]['service']]['name'] + '</h3>')
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

			// // More info
			// var newHref = 'archive.html#' + getHash() +'?query=' + encodeURIComponent(data[index]['query']) + '&service=' + data[index]['service'] + '&lightbox=true';
			// $(itemDescription).append('<p><a href="' + newHref + '">More Info</a></p>');
			
			$(itemDescription).addClass(data[index]['service'])
							  .appendTo(itemContainer);
		}

		drawLayout(container);		
		attachEvents();
	}

	var createStack = function(n, container, service, el){

		// console.log('Called createStack.');

		for(var i = 0; i < n; i++){

			var proto = $('<div class="' + service + '"></div>')
						.appendTo('body');
			var color = rgbToHsl($(proto).css('border-color'));
			$(proto).remove();
			
			var params = {
							top: - (i + 1) * 4,
							left: - (i + 1) * 4,
							'z-index': - i - 1,
							'border-color': parseHsl(color.h, color.s, (color.l + (90 - color.l)/n * (i+1)) )
						};

			if(service == 'web'){
				var stack = $(el)
							.addClass('stack')
							.addClass(service)
							.css(params);
			
			}else{

				if(service == 'images'){
					params.width = $(container).width();
					params.height = $(container).height();
				}

				var stack = $('<div class="stack ' + service + '"></div>')
						.css(params);
			}

			$(container).prepend(stack);
		}	
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

	/*-------------------- MORE INFO ---------------------*/

	var loadMoreInfo = function(query, service){

		console.log('Calling loadMoreInfo.')
		console.log('Requesting: ' + query + ' at ' + service + '.');

		common.appendLoader('#lightbox');

		$.post('/query', {
			query: query,
			service: service
		}, function(response) {
	        // console.log(response);
	        if(response.error){
	        	throw response.error

	        // Loaded results
	        }else{
	        	console.log('Got response from server.');
	        	console.log(response);

	        	$('#lightbox').empty();
	        	$('#lightbox-detail').empty();
	        	// Only proceed if the lightbox is still active
	        	// (the user might have closed it before loading)
	        	if($('#lightbox').css('display') == 'block'){
	        		processMoreInfo(response);
	        	}
	        }
	    });
	}

	var processMoreInfo = function(data){

		console.log('Called processMoreInfo.')

		data['results'] = common.refineDates(data['results']);

		/*---------- Dates Tables ----------*/
		var groupedByDate = _.groupBy(data['results'], function(item, index, array){
			// console.log(item['date']);
			return item['date'];
		});
		// console.log(groupedByDate);

		var sortedByDate = _.sortBy(groupedByDate, function(value, key, collection){
			return key;
		});
		// console.log(sortedByDate);

		/*---------- D3 Chart ----------*/
		var groupedByLanguage = _.groupBy(data['results'], function(item, index, array){
			return item['language_name'];
		});
		// console.log(groupedByLanguage);

		// Let's make things easier for D3... Passing the min and max dates
		var dateRange = [sortedByDate[0][0]['date'], sortedByDate[sortedByDate.length - 1][0]['date']];
        // D3 needs an Array! You can't pass the languages as keys
        groupedByLanguage = _.toArray(groupedByLanguage);
        for(var i in groupedByLanguage){
        	groupedByLanguage[i] = _.sortBy(groupedByLanguage[i], function(item, index, array){
        		return item['date'];
        	});
        }
        appendDetail(data['main']);
		drawChart(data['main'], groupedByLanguage, dateRange);
	}

	var appendDetail = function(data){

		console.log('Called appendDetail');

		if(data['service'] != 'web'){
			$('#lightbox-detail').show();
		}

		if(data['service'] == 'youtube'){
			var itemContent = $('<div class="content">' +
									'<div detail="1" style="background-image: url(' + data['thumbnail'] + ')" videoid="' + data['videoId'] + '">' +
										'<img src="/assets/img/play.png"/>' +
									'</div>' +
								'</div>');

		}else if(data['service'] == 'images'){
			var itemContent = $('<div class="content">' +
									'<img src="' + data['url'] + '" />' +
								'</div>');
		
		}

		$(itemContent).addClass(data['service'])
		$(itemContent).children().addClass(data['service']);
		$(itemContent).appendTo('#lightbox-detail');

		attachEvents();
	}

	var drawChart = function(main, dataset, dateRange){

		console.log('Called drawChart');

		// Header
		// $('#lightbox').addClass(main['service']);
		$('#lightbox').append('<div id="close-bt"><img src="/assets/img/close_bt.png" /></div>');
		$('#lightbox').append('<h1>' + main['query'] + '</h1>')
		$('#lightbox').append('<h2>' + servicesAlias[main['service']]['name'] + '</h2>');

		/*----- LAYOUT -----*/
		var svgSize = {	width: 600, height: 300	};
		var margin = { top: 50, right: 70, bottom: 50, left: 100 };
		var width  = svgSize.width - margin.left - margin.right;
		var height = svgSize.height - margin.top - margin.bottom;
		
		var languagesPalette = [];
		for(var i in dataset){
			var hue = i * 360 / dataset.length;
			languagesPalette.push({
				language_name: dataset[i][0]['language_name'],
				language_code: dataset[i][0]['language_code'],
				color: parseHsla({h: hue, s: 100, l: 50, a: 0.5})	
			});
		}
		// console.log(languagesPalette);

		// Canvas
		var svg = d3.select('#lightbox')
					.append('svg')
					.attr('id', 'chart')
					.attr('width', width + margin.left + margin.right)
				    .attr('height', height + margin.top + margin.bottom);		

        // Now the whole chart will be inside a group
        var chart = svg.append("g")
                       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");				    

		var xScale = d3.time.scale()
						.domain(d3.extent(dateRange, function(d, i){
							return d;
						}))
						.range([0, width]);

		var yScale = d3.scale.linear()
					   .domain([1, 10])
					   .range([0, height]);

		var line = d3.svg.line()
					    .x(function(d, i) {
					    	return xScale(d['date']);
					    })
					    .y(function(d) {
					    	return yScale(d['ranking'] + 1);
					    });


		// X Scale
		var xAxis = d3.svg.axis()
							.ticks(5)
							.innerTickSize(20)
						    .scale(xScale)
						    .orient("bottom");

		// Y Scale
		var yAxis = d3.svg.axis()
						    .innerTickSize(20)
						    .scale(yScale)
						    .orient("left");

        // Now appending the axes
        chart.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "x axis")
            .call(xAxis);

        chart.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text") // Label
            .attr("transform", "rotate(-90)")
            .attr("y", -55)
            .attr("x", 25)
            .attr("class", "label")
            .style("text-anchor", "end")
            .text("Position on Autocomplete");

		// d3.selectAll("g.y.axis g.tick line")
		//     .attr("x2", function(d){
		//            return width;
		//     });

	  	// Lines
		var language = chart.selectAll(".line")
				      		.data(dataset)
						    .enter()
							.append("path")
							.attr("class", "line")
							// .attr('stroke', parseHsla(categoriesColors[parseInt(cat) - 1], 1))
							.attr('stroke', function(d, i){
								return languagesPalette[i]['color'];
							})
							.attr('d', function(d, i){
								// console.log(d);
								// Shrinking lines to 0
								var emptyHistory = [];
								for(var j in d){
									var emptyRecord = {
										ranking: 9,
										date: d[j]['date']
									};
									emptyHistory.push(emptyRecord);
								}
								return line(emptyHistory);
							})
							.transition()
							.duration(1000)
							.attr("d", function(d, i) {
								return line(d);
							});
							

		var languagesList = $('<ul></ul>');
		for(var i in languagesPalette){
			$(languagesList).append('<li class="language-bt">' +
										'<div class="language-marker" style="background-color:' + languagesPalette[i]['color'] + '"></div>' +
										'<a href="" query="' + encodeURI(main['query']) + '" service="' + main['service'] + '" language="' + languagesPalette[i]['language_code'] + '">' + languagesPalette[i]['language_name'] + '</a>' +
									'</li>');
		}
		$('#lightbox').append(languagesList);

		setTimeout(addShareButtons, 1000);
		attachEvents();
	}	

	/*-------------------- AUX FUNCTIONS ---------------------*/

	var attachEvents = function(){

		// Lightbox
		$('#lightbox-shadow').off('click').on('click', function() {
			removeLightbox();
		});

		$('#close-bt').off('click').on('click', function() {
			removeLightbox();
		});

		var languageRollover;

		$('.language-bt').off('mouseenter').on('mouseenter', function() {
			clearTimeout(languageRollover);
			createTooltip($(this));
		})				
		.off('mouseleave').on('mouseleave', function() {
	    	clearTimeout(languageRollover);
	    	languageRollover = setTimeout(function(){
	    		$('.language-tooltip').remove();
	    	}, 1000);
		});

		$('.language-tooltip').off('mouseenter').on('mouseenter', function(){
			clearTimeout(languageRollover);
		})
		.off('mouseleave').on('mouseleave', function(){
			$('.language-tooltip').remove();
		});


		// Play video
		$('.content.youtube').children('.youtube').off('click').on('click', function(){
			// console.log($(this).attr('videoid'));
			// console.log($(this).attr('detail'));
			$(this).html(embedYoutube($(this).attr('videoid'), $(this).attr('detail')));
		});

		// Hash router
	    $(window).off('hashchange').on('hashchange', function() {
	    	console.log('Hash router');
	    	var newHash = getHash();
	    	console.log('New hash: ' + newHash);
	    	console.log('Current hash: ' + currentHash);
	    	if(newHash != currentHash){
	    		loadData(newHash);
	    		currentHash = newHash;	
	    	}else if(common.getParameterByName('lightbox') != null){
	    		createLightbox();
	    	}	        
	    });

		// Show description
		$('.item').off('mouseenter').on('mouseenter', function(){

			$(this).children('.description').css({
				'display': 'block',
				'z-index': 1000
			});

			// HOVER
			// console.log('Width: ' + hover.width + ', ' + 'Height: ' + hover.height);
			var hoverSize = {
				width: $(this).children('.content').width(),
				height: $(this).children('.content').height()
			}

			// console.log($(this).children('.content').attr('class'));
			var service = $(this).children('.content').attr('class').split(' ')[1];
			var query = $(this).children('.content').attr('query');
			// console.log(service);
			
			var hoverDiv = $('<div></div>')
							.addClass('hover')
							.addClass(service)
							.css({
								width: hoverSize.width,
								height: hoverSize.height
							})
							.off('click').on('click', function(){
								window.location.href= 'archive.html#' + getHash() +'?query=' + encodeURIComponent(query) + '&service=' + service + '&lightbox=true';
							});

			var hoverIcon = $('<div class="hover-icon"></div>')
							.css({
								top: (hoverSize.height/2 - 20),
								left: (hoverSize.width/2 - 20)
							});

			$(this).append(hoverDiv)
				   .append(hoverIcon);
		});

		$('.item').off('mouseleave').on('mouseleave', function(){
			$(this).children('.description').css({
				'display': 'none',
				'z-index': 'auto'
			});
			$(this).children('.hover').remove();
			$(this).children('.hover-icon').remove();
		});	
	}

	var addShareButtons = function(){

		$.post('/shorten', {
			url: window.location.href
		}, function(response) {
	        if(response.error){
	        	throw response.error

	        }else{
	        	console.log('Got response from server.');
	        	console.log(response);

				// TWITTER
				$('#lightbox').append('<a id="twitter-share"></a>')
				twttr.widgets.createShareButton(
					response,
					document.getElementById('twitter-share'),
					{
						count: 'none',
						text: common.getParameterByName('query') + ' on Autocomplete Archive'
					})
					.then(function (el) {
						console.log("Twitter button created.")
					});

				// FACEBOOK
				$('<img id="fb-share" src="/assets/img/fb.png" />')
				.on('click', function(){
					var url = window.location.href.substring(0, window.location.href.indexOf('#')) +
							  window.location.href.substring(window.location.href.indexOf('#') + 2, window.location.href.length);
					console.log(url)
					FB.ui({
						method: 'share',
						// href: response
						href: url
					},
					// callback
					function(response) {
						if (response && !response.error_code) {
						  console.log('Posting completed.');
						} else {
						  console.log('Error while posting.');
						}
					});
				})
				.appendTo('#lightbox');
	        }
	    });			
	}

	var createLightbox = function(){
		// console.log('query:' + common.getParameterByName('query'));
		// console.log('service:' + common.getParameterByName('service'));

		$('#lightbox-shadow').show();
		$('#lightbox').empty()
					  .removeClass()
					  .addClass(common.getParameterByName('service'))
					  .show();
		$('#lightbox-detail').empty()
							 .removeClass();					  
		loadMoreInfo(common.getParameterByName('query'), common.getParameterByName('service'));	
	}

	var removeLightbox = function(){
		clearParameters();
		$('#lightbox').empty()
					  .hide()
					  .removeClass();
		$('#lightbox-detail').empty()
							 .hide()
							 .removeClass();					  
		$('#lightbox-shadow').hide();
		// $('#twitter-widget-0').remove();
		// $('.fb-share-button.fb_iframe_widget').remove();
	}

	var createTooltip = function(obj){

		$('.language-tooltip').remove();

		var linkColor = $(obj).children('.language-marker').css('background-color');
		var linkPosition = $(obj).offset();
		var linkSize = {
			width: $(obj).width(),
			height: $(obj).height()
		}
		var linkWidth = $(obj).width();
		var query = $(obj).children('a').attr('query');
		var service = $(obj).children('a').attr('service');
		var language = $(obj).children('a').attr('language');
		var translateLanguage = (language == 'pt-BR') ? ('pt') : (language);
		// console.log(query + ', ' + service + ', ' + language);

		$('<div class="language-tooltip">' +				
			'<a href="' + servicesAlias[service]['search_address'] + query + '&hl=' + language + '" target="_blank">Search</a>' + 
			'<br />' +
			'<a href="https://translate.google.com/?ie=UTF-8&hl=en#' + translateLanguage + '/en/' + query + '" target="_blank">Translate</a>' + 				
		  '</div>')
		  .css({
		  	'top': (linkPosition.top + linkSize.height) + 'px',
		  	'left': (linkPosition.left) + 'px',
		  	'min-width': linkWidth + 'px',
		  	'border-color': linkColor
		  })
		  .appendTo('body');

		  attachEvents();
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

	var embedYoutube = function(id, controls){
		// console.log(controls);
		if(controls > 0){
			var iframe = '<iframe src="https://www.youtube.com/embed/' +
						 id +		
						 '?autoplay=1&controls=' + controls + '" frameborder="0" allowfullscreen></iframe>';
			return iframe;			
		}
	}

	var parseHsla = function(color){
		var myHslaColor = 'hsla(' + color.h + ', ' + color.s + '%, ' + color.l + '%, ' + color.a +')';
		return myHslaColor;
	}

	var getHash = function(){
		// console.log('Current hash is: ' + location.hash)
		return location.hash.substring(1, 2);
	}

	var fixHash = function(){
		if (location.hash.indexOf('#') < 0) {
			var letter = common.getParameterByName('query').substring(0, 1).toUpperCase();
			var newUrl = window.location.href.substring(0, window.location.href.indexOf('?')) +
						 '#' + letter +
						 window.location.href.substring(window.location.href.indexOf('?'), window.location.href.length);
			console.log('New url is: ' + newUrl);
			window.location.href = newUrl;
		};
	}

	var clearParameters = function(){
		console.log('Calling clearParameters');
		if(window.location.href.indexOf('?') > -1){
			var newUrl = window.location.href.substring(0, window.location.href.indexOf('?'));
			console.log('Cleaned up url parameters: ' + newUrl);
			window.location.href = newUrl;
			// location.hash = location.hash.substring(0, location.hash.indexOf('?'));
		}
	}

	var rgbToHsl = function(colorString){

		var components = colorString.substring(colorString.indexOf('(') + 1, colorString.indexOf(')')).split(',');
		var r = components[0];
		var g = components[1];
		var b = components[2];

	    r /= 255, g /= 255, b /= 255;
	    var max = Math.max(r, g, b), min = Math.min(r, g, b);
	    var h, s, l = (max + min) / 2;

	    if(max == min){
	        h = s = 0; // achromatic
	    }else{
	        var d = max - min;
	        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	        switch(max){
	            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	            case g: h = (b - r) / d + 2; break;
	            case b: h = (r - g) / d + 4; break;
	        }
	        h /= 6;
	    }

	    return {
	    	h: Math.floor(h * 360),
	    	s: Math.floor(s * 100),
	    	l: Math.floor(l * 100) 
	    };
	}

	var parseHsl = function(h, s, l){
		var myHslColor = 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
		//console.log('called calculateAngle function');
		return myHslColor;
	}	

	/*-------------------- APP INIT ---------------------*/

	// GLOBAL VARS
	var servicesAlias = {
		web: {
			name: 'Google Web',
			search_address: 'https://www.google.com/#q='
		},
		images: {
			name: 'Google Images',
			search_address: 'https://www.google.com/search?site=imghp&tbm=isch&q='
		},
		youtube: {
			name: 'Youtube',
			search_address: 'https://www.youtube.com/results?search_query='
		}
	}

	// Init
	fixHash();
	common.appendNavBar(true, function(){
		common.attachNavBarEvents();
	});
	var currentHash = getHash();
	loadData(currentHash);
	if(common.getParameterByName('lightbox') != null){
		createLightbox();
	}		
});

/*-------------------- DEPRECATED ---------------------*/

// Infinite scroll
// $(window).scroll(function()	{
//     if($(window).scrollTop() == $(document).height() - $(window).height()) {
//         loadData(location.hash.substring(1, location.hash.length));
//     }
// });