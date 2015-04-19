/* Your code starts here */

var app = {};

app.init = function() {
	var obj = {
	    videoId: 'jtDnmVjPfvM',
	    thumbnail: 'https://i.ytimg.com/vi/jtDnmVjPfvM/hqdefault.jpg'
	};

	$('body').append('<iframe width="560" height="315" src="https://www.youtube.com/embed/' + obj['videoId'] + '" frameborder="0" allowfullscreen></iframe>')
};

app.init();