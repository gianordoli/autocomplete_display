/* Your code starts here */

define(function (require) {
	
	console.log('Loading common functions...')

	return {
		appendLoader: function(container){
			var loaderContainer = $('<div id="loader-container"></div>')
			var loader = $('<span class="loader"></span>');

			$(container).append(loaderContainer);
			$(loaderContainer).append(loader);
		},

		// Some milliseconds are messed up!
		// This function set minutes, seconds and millis to zero
		refineDates: function(data){
			for(var i in data){
				data[i]['date'] = new Date(data[i]['date']);
				data[i]['date'].setMinutes(0);
				data[i]['date'].setSeconds(0);
				data[i]['date'].setMilliseconds(0);
				data[i]['date'] = data[i]['date'].getTime();
			}
			return data;
		},

		// Formats UTC date to MM/DD/YYYY
		formatDateMMDDYYY: function(date){
			var newDate = new Date(date);
			// console.log(newDate);
			var monthString = newDate.getMonth() + 1;
			if (monthString < 10) monthString = '0' + monthString;
			var dateString = newDate.getDate();
			var yearString = newDate.getFullYear();
			return monthString + '/' + dateString + '/' + yearString;
		}			
	} 
});