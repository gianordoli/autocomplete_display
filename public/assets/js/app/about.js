define(['./common'], function (common) {

	/*-------------------- MAIN FUNCTIONS --------------------*/
	var loadData = function(){

		console.log('Calling loadData.');

		$.post('/about', {}, function(response) {
	        // console.log(response);
	        if(response.error){
	        	throw response.error

	        // Loaded results
	        }else{
	        	console.log('Got response from server.');
	        	console.log(response);
	        	processData(response)
	        }
	    });
	}

	var processData = function(data){

		console.log('Called processData.');

		var groupedbyService = _.groupBy(data['results'], function(item, index, list){
			return item['service'];
		});
		// console.log(groupedbyService);
		
		for(var key in groupedbyService){
			// console.log(key);
			// console.log(groupedbyService[key]);
			groupedbyService[key] = _.groupBy(groupedbyService[key], function(item, index, list){
				return item['letter'];
			});
			// console.log(groupedbyService[key]);

			for(var letter in groupedbyService[key]){
				groupedbyService[key][letter] = _.map(groupedbyService[key][letter], function(item, index, list){
					return item['query'];
				});
			}
			groupedbyService[key] = _.toArray(groupedbyService[key]);			
		}

		appendResults(groupedbyService);
	}

	var appendResults = function(data){

		console.log('Appending results...');

		animationData = data;
		console.log(animationData);

		// for(var key in data){
		// 	$('#container').append('<div class="animation" id="' + key + '"></div>');
		// }
		setInterval(function(){

			// Letter
			var letter = animationData['web'][animationFrame][0].substring(0, 1);
			$('.animation#web > .search-box').html(letter);
			
			// Predictions
			var predictions = animationData['web'][animationFrame];
			$('.animation#web > .predictions').empty();
			var predictionsList = $('.animation#web > .predictions').append('<ul></ul>');
			for(var i in predictions){
				$(predictionsList).append('<li>' + predictions[i] + '</li>');
			}
			
			// Net iteration
			animationFrame ++;
			if(animationFrame >= animationData['web'].length){
				animationFrame = 0;
			}

		}, 2000);

	}

	var attachEvents = function(){

		
	}

	/*-------------------- APP INIT ---------------------*/
	// GLOBAL VARS
	var servicesAlias = {
		web: 'Google Web',
		images: 'Google Images',
		youtube: 'Youtube'
	}

	var animationData;
	var animationFrame = 0;

	loadData();	

});