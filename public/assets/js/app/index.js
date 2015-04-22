/* Your code starts here */

var app = {};

app.init = function() {

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
	        	console.log('Got response from server.');
	        	// console.log(response);
	        	console.log('Got ' + response.length + ' total objects.');

	        	var clusteredData = _.groupBy(response, function(item, index, list){
	        		// console.log(item['query']);
	        		return item['query'];
	        	});
	        	console.log(clusteredData);
	        	console.log('Clustering to ' + Object.keys(clusteredData).length + ' unique objects.');
	        	clusteredData = _.shuffle(clusteredData);
	        	
	        	clusteredData = _.sample(clusteredData, 50);

	        	appendResults(clusteredData);
	        }
	    });				
	}

	var appendResults = function(data){
		console.log('Appending results...');
		var container = $('#container');
		for(var key in data){
			data[key].forEach(function(item, index, array){
				// console.log(item);
				var itemContainer = $('<div class="item"></div>');

				if(item['service'] == 'youtube'){
					var itemContent = $('<img src="' + item['thumbnail'] + '" />');
				
				}else if(item['service'] == 'images'){
					var itemContent = $('<img src="' + item['url'] + '" />')
				
				}else{
					var itemContent = $('<h2>' + item['query'] + '</h2>');
				}

				var itemDescription = $('<ul>' +
										'<li>query: ' + item['query'] + '</li>' +
										'<li>language: ' + item['language_name'] + '</li>' +
										'<li>service: ' + item['service'] + '</li>' +
										'<li>ranking: ' + item['ranking'] + '</li>' +
										'</ul>');

				$(container).append(itemContainer);
				$(itemContainer).append(itemContent)
								.append(itemDescription);

				drawLayout(container);
			});				
		}		
	}

	var drawLayout = function(parentDiv){
		$container = $(parentDiv).masonry();
		$('.item').css('visibility', 'hidden');
		// layout Masonry again after all images have loaded
		$container.imagesLoaded( function() {
			$container.masonry({
				// columnWidth: 50,
				containerStyle: null,
				itemSelector: '.item'
			});
			$container.masonry('on', 'layoutComplete', function(items){
				$('#loader-container').remove();
				$('.item').css('visibility', 'visible');
			  	// attachEvents();
			});
		});
	}	

	loadData();

	// var obj = {
	//     videoId: 'jtDnmVjPfvM',
	//     thumbnail: 'https://i.ytimg.com/vi/jtDnmVjPfvM/hqdefault.jpg'
	// };

	// $('body').append('<iframe width="560" height="315" src="https://www.youtube.com/embed/' + obj['videoId'] + '" frameborder="0" allowfullscreen></iframe>')
};

app.init();