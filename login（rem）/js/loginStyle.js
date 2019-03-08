$(function () {

	resizeCss();

	$(window).resize(function () {
		resizeCss();
	});

	// fn
	function resizeCss() {
		var viewHeight = $(window).height();
		var footHeight = 50;
		var time = 300;
		$('footer').animate({
			height: footHeight + 'px'
		}, time);
		$('.content').animate({
			height: viewHeight - footHeight + 'px'
		}, time);
		
	}

})