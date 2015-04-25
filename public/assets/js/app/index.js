/* Your code starts here */

var app = {};

app.init = function() {

	var appendNavBar = function(){
		var ul = $('<ul></ul>');
		for(var i = 65; i <= 90; i++){
			var letter = String.fromCharCode(i);
			var li = $('<li><a class="letter-bt" href="#">' + letter  +'</a>');
			$(ul).append(li);
		}
		$('nav').append(ul);

		attachEvents();
	}

	var loadData = function(letter){

		if(letter != currLetter){
			$('#container').empty();
			// append loading
			currLetter = letter;
		}

		var startDate = new Date(2015, 02, 24);
		console.log(startDate.getTime());
		// console.log(startDate.getHours());
		// startDate = convertToServerTimeZone(startDate);
		// console.log(startDate.getHours());

		$.post('/start', {
			date: startDate.getTime(),
			letter: letter
		}, function(response) {
	        // console.log(response);
	        if(response.error){
	        	throw response.error	
	        }else{
	        	console.log('Got response from server.');
	        	// console.log(response);
	        	console.log('Got ' + response.length + ' total objects.');

	        	var clusteredData = _.groupBy(response, function(item, index, list){
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

	        	appendResults(sortedData);
	        }
	    });				
	}

	var appendResults = function(data){
		
		console.log('Appending results...');
		
		var dayContainer = $('<div class="day-container"></div>');
		$('#container').append(dayContainer);

		for(var index in data){

			var itemContainer = $('<div class="item"></div>');

			data[index].forEach(function(item, index, array){
				// console.log(item);	
				
				if(item['service'] == 'youtube'){
					var itemContent = $('<div class="video-container" ' +
										'style="background-image: url(' + item['thumbnail'] + ')" ' +
										'videoid="' + item['videoId'] + '">' +
										'<img src="/assets/img/play.png"/>' +
										'</div>');
				
				}else if(item['service'] == 'images'){
					var itemContent = $('<div class="img-container">' +
										'<img src="' + item['url'] + '" />' +
										'</div>');
				
				}else{
					var itemContent = $('<h2>' + item['query'] + '</h2>');
				}

				var itemDescription = $('<ul>' +
										'<li>query: ' + item['query'] + '</li>' +
										'<li>language: ' + item['language_name'] + '</li>' +
										'<li>service: ' + item['service'] + '</li>' +
										'<li>ranking: ' + item['ranking'] + '</li>' +
										'</ul>');

				$(itemContainer).append(itemContent)
								.append(itemDescription);
			});

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

		// 	$container.masonry('on', 'layoutComplete', function(items){
		// 		console.log('Masonry layout complete.');
		// 		$('#loader-container').remove();
		// 		$('.item').css('visibility', 'visible');
		// 	  	// attachEvents();
		// 	});
		});
	}

	var attachEvents = function(){
		$('.video-container').off().on('click', function(){
			console.log($(this).attr('videoid'));
			$(this).html(embedYoutube($(this).attr('videoid')));
		});

		$('a.letter-bt').off().on('click', function(){
			loadData($(this).html());
		});		
	}

	var embedYoutube = function(id){
		var iframe = '<iframe src="https://www.youtube.com/embed/' +
					 id +		
					 '?autoplay=1&controls=0" frameborder="0" allowfullscreen></iframe>';
		return iframe;
	}

	// GLOBAL VARS
	var currLetter = 'a';
	var isMasonry = false;

	loadData(currLetter);
	appendNavBar();

	// var obj = {
	//     videoId: 'jtDnmVjPfvM',
	//     thumbnail: 'https://i.ytimg.com/vi/jtDnmVjPfvM/hqdefault.jpg'
	// };

	// $('body').append('<iframe width="560" height="315" src="https://www.youtube.com/embed/' + obj['videoId'] + '" frameborder="0" allowfullscreen></iframe>')
};

app.init();