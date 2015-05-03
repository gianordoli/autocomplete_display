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


		setInterval(function(){
			for(var key in data){
				// Letter
				var letter = animationData[key][animationFrame][0].substring(0, 1);
				$('.animation#' + key + ' > .search-box').html(letter);
				
				// Predictions
				var predictions = animationData[key][animationFrame];
				$('.animation#' + key + ' > .predictions').empty();
				var predictionsList = $('<ul></ul>');
				for(var i in predictions){
					$(predictionsList).append('<li>' + predictions[i] + '</li>');
				}
				$('.animation#' + key + ' > .predictions').append(predictionsList);
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