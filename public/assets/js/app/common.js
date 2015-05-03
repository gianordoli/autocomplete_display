/* Your code starts here */

define(function (require) {
	
	console.log('Loading common functions...')

	return {
		appendNavBar: function(isArchive, callback){

			console.log('Appending NavBar');

			var servicesUl = $('<ul id="services">' +
									'<li class="web"><div></div>Google Web</li>' +
									'<li class="images"><div></div>Google Images</li>' +
									'<li class="youtube"><div></div>Youtube</li>' +
								'</ul>');
			var lettersUl = $('<ul id="letters"></ul>');
			for(var i = 65; i <= 90; i++){
				var letter = String.fromCharCode(i);
				$(lettersUl).append('<li><a class="letter-bt" href="#' + letter + '">' + letter  +'</a></li>');					
			}

			// Title
			$('nav#header').append('<h1><a href="archive.html#A"><span>Google Autocomplete</span> Archive</a></h1>');
			
			// Services
			if(isArchive){ $('nav#header').append(servicesUl); }
			
			// Purple bar
			var bar = $('<div id="bar"></div>')
						.appendTo('nav#header');

			// Letters
			if(isArchive){ $(bar).append(lettersUl); }

			// About
			$('nav#header').append('<div id="about"><p>?</p></div>' +
									'<ul id="pages-links">' +
										'<li><a href="about.html">About</a></li>' +
										'<li><a href="faq.html">FAQ</a></li>' +
										'<li><a href="technology.html">Tech Info</a></li>' +
									'</ul>');

			callback();

		},

		attachNavBarEvents: function(){

			console.log('Attaching events to NavBar');

		    var rollover;
		    var toggleMenu = function(display){
		    	if(display){
		    		$('#pages-links').css('display', 'inline-block');
		    	}else{
					$('#pages-links').css('display', 'none');
		    	}
	    	}

			// About
		    $('#about').off('mouseenter').on('mouseenter', function() {
		    	clearTimeout(rollover);
		        toggleMenu(true);
		    });
		    $('#about').off('mouseleave').on('mouseleave', function() {
		    	clearTimeout(rollover);
		    	rollover = setTimeout(function(){
		    		toggleMenu(false);
		    	}, 2000);
		    });

			// ABOUT links
		    $('#pages-links').off('mouseenter').on('mouseenter', function() {
		    	clearTimeout(rollover);
		        toggleMenu(true);
		    });		
		    $('#pages-links').off('mouseleave').on('mouseleave', function() {
		    	clearTimeout(rollover);
		    	rollover = setTimeout(function(){
		    		toggleMenu(false);
		    	}, 2000);
		    });
		},

		appendLoader: function(container){
			var loaderContainer = $('<div id="loader-container"></div>')
			var loader = $('<span class="loader"></span>');

			$(container).append(loaderContainer);
			$(loaderContainer).append(loader);
		},

		getParameterByName: function(name) {
		    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		        results = regex.exec(location.search);
		    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
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