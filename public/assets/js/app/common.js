/* Your code starts here */

define(function (require) {
	
	console.log('Loading common functions...')

	return {
		appendLoader: function(container){
			var loaderContainer = $('<div id="loader-container"></div>')
			var loader = $('<span class="loader"></span>');

			$(container).append(loaderContainer);
			$(loaderContainer).append(loader);
		}
	} 
});