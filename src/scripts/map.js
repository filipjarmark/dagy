function initMap() {
	var image = document.getElementById('map-image');
	var el = document.getElementById('map');
	var center = {
		lat: parseFloat(el.getAttribute('data-lat')),
		lng: parseFloat(el.getAttribute('data-lng'))
	};

	var map = new google.maps.Map(el, {
		zoom: 14,
		center: center,
		disableDefaultUI: true,
		scrollwheel: false,
		zoomControl: true
	});
	var marker = new google.maps.Marker({
		position: center,
		map: map
	});
}
