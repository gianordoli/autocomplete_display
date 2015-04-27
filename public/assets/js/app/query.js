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

		// Some milliseconds are messed up!
		// Let's set minutes, seconds and millis to zero
		for(var i in data['results']){
			data['results'][i]['date'] = new Date(data['results'][i]['date']);
			data['results'][i]['date'].setMinutes(0);
			data['results'][i]['date'].setSeconds(0);
			data['results'][i]['date'].setMilliseconds(0);
			data['results'][i]['date'] = data['results'][i]['date'].getTime();
		}

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

		// DESCRIPTION
		var mainDescription = $('<div class="description"><div>');

			// Query
			if(main['service'] != 'web'){
				$(mainDescription).append('<h2>' + main['query'] + '</h2>');
			}

			// Service
			$(mainDescription).append('<h3>' + servicesAlias[main['service']] + '</h3>');			

		$('#container').append(mainContainer);
		$(mainContainer).append(mainContent)
						.append(mainDescription);

		// DATES
		for(var i in data){
			// console.log(data[i]);

			var dateContainer = $('<div class="date-container"></div>');
			$(dateContainer).append('<h2>' + formatDateMMDDYYY(data[i][0]['date']) + '</h2>');

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

		attachEvents();
	}

	var attachEvents = function(){

		console.log('Called attachEvents.');

		// Play video
		$('.main.youtube').children('.content').off('click').on('click', function(){
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

	// Formats UTC date to MM/DD/YYYY
	var formatDateMMDDYYY = function(date){
		var newDate = new Date(date);
		// console.log(newDate);
		var monthString = newDate.getMonth() + 1;
		if (monthString < 10) monthString = '0' + monthString;
		var dateString = newDate.getDate();
		var yearString = newDate.getFullYear();
		return monthString + '/' + dateString + '/' + yearString;
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