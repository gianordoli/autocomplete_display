define(['./common', 'd3'], function (common) {

	var loadData = function(query, service){

		console.log('Calling loadData.')
		console.log('Requesting: ' + query + ' at ' + service + '.');

		common.appendLoader(container);

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

				$(container).empty();
	        	processData(response);
	        }
	    });
	}

	var processData = function(data){

		console.log('Called processData.')

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

		appendResults(data['main'], sortedByDate);


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

		drawChart(groupedByLanguage, dateRange);
	}

	var appendResults = function(main, data){

		console.log('Appending results...');
		// console.log(main);

		// HEADER
		var header = $('<div class="query-page-header ' + main['service'] + '"><div>');
			// Query
			$(header).append('<h1>' + main['query'].toUpperCase() + '</h1>');
			// Service
			$(header).append('<h2 class="description ' + main['service'] + '">' + servicesAlias[main['service']] + '</h2>');			
		$('#container').append(header);	
		$('#container').append('<br/>');		
				
		// CONTENT		
		if(main['service'] != 'web'){
			var mainContainer = $('<div class="main"></div>');

			// YOUTUBE
			if(main['service'] == 'youtube'){

				var mainContent = $('<div class="content ' +  main['service'] + '" ' +
									'style="background-image: url(' + main['thumbnail'] + ')" ' +
									'videoid="' + main['videoId'] + '">' +
									'<img src="/assets/img/play.png"/>' +
									'</div>');
			// GOOGLE IMAGES
			}else if(main['service'] == 'images'){

				var mainContent = $('<div class="content ' +  main['service'] + '">' +
									'<img src="' + main['url'] + '" />' +
									'</div>');
			}
			$('#container').append(mainContainer);
			$(mainContainer).append(mainContent);
		}

		// appendDates(data);

		attachEvents();
	}

	var attachEvents = function(){

		console.log('Called attachEvents.');

		// Play video
		$('.content.youtube').off('click').on('click', function(){
			console.log($(this).attr('videoid'));
			$(this).html(embedYoutube($(this).attr('videoid')));
		});
	}

	var embedYoutube = function(id){
		var iframe = '<iframe src="https://www.youtube.com/embed/' +
					 id +		
					 '?autoplay=1" frameborder="0" allowfullscreen></iframe>';
		return iframe;
	}

	var parseHsla = function(color){
		var myHslaColor = 'hsla(' + color.h + ', ' + color.s + '%, ' + color.l + '%, ' + color.a +')';
		return myHslaColor;
	}

	var drawChart = function(dataset, dateRange){

		console.log('Called drawChart');

		/*----- LAYOUT -----*/
		var svgSize = {	width: 600, height: 400	};
		var margin = { top: 10, right: 80, bottom: 50, left: 80 };
		var width  = svgSize.width - margin.left - margin.right;
		var height = svgSize.height - margin.top - margin.bottom;
		
		var languagesPalette = [];
		for(var i in dataset){
			var hue = i * 360 / dataset.length;
			languagesPalette.push({
				language_name: dataset[i][0]['language_name'],
				color: parseHsla({h: hue, s: 100, l: 50, a: 0.5})	
			});
		}
		// console.log(languagesPalette);

		// Header
		var chartContainer = $('<div id="chart-container"></div>');
		$('#container').append(chartContainer);

		// Canvas
		var svg = d3.select('#chart-container')
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
            .attr("y", -40)
            .attr("x", -height/2)
            .attr("class", "label")
            .style("text-anchor", "end")
            .text("Position");

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
			$(languagesList).append('<li><div class="language-marker" style="background-color:' + languagesPalette[i]['color'] + '"></div>' + languagesPalette[i]['language_name'] + '</li>')
		}
		$(chartContainer).append(languagesList);

	}

	var appendDates = function(data){
		// DATES
		for(var i in data){
			// console.log(data[i]);

			var dateContainer = $('<div class="date-container"></div>');
			$(dateContainer).append('<h2>' + common.formatDateMMDDYYY(data[i][0]['date']) + '</h2>');

			// Languages
			var sortedByRanking = _.sortBy(data[i], function(item, index, list){
				return item['ranking'];
			});
			var languagesList = $('<ul></ul>');

			for(var j in sortedByRanking){
				// console.log(data[i][j]);
				$(languagesList).append('<li>' + '#' + (sortedByRanking[j]['ranking'] + 1) + ' in ' + sortedByRanking[j]['language_name'] + '</li>');
			}

			$('#container').append(dateContainer);
			$(dateContainer).append(languagesList);
		}		
	}

	// GLOBAL VARS
	var servicesAlias = {
		web: 'Google Web',
		images: 'Google Images',
		youtube: 'Youtube'
	}
	var query = decodeURIComponent(location.hash.substring(1, location.hash.indexOf('?')));
	var service = location.hash.substring(location.hash.indexOf('?') + 1, location.hash.length);
	loadData(query, service);	

});