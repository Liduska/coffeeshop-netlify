function coffeeshop_googlemap_init(dom_obj, coords) {
	"use strict";
	if (typeof COFFEESHOP_STORAGE['googlemap_init_obj'] == 'undefined') coffeeshop_googlemap_init_styles();
	COFFEESHOP_STORAGE['googlemap_init_obj'].geocoder = '';
	try {
		var id = dom_obj.id;
		COFFEESHOP_STORAGE['googlemap_init_obj'][id] = {
			dom: dom_obj,
			markers: coords.markers,
			geocoder_request: false,
			opt: {
				zoom: coords.zoom,
				center: null,
				scrollwheel: false,
				scaleControl: false,
				disableDefaultUI: false,
				panControl: true,
				zoomControl: true, //zoom
				mapTypeControl: false,
				streetViewControl: false,
				overviewMapControl: false,
				styles: COFFEESHOP_STORAGE['googlemap_styles'][coords.style ? coords.style : 'default'],
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}
		};

		coffeeshop_googlemap_create(id);

	} catch (e) {

		console.log(e);

	};
}

function coffeeshop_googlemap_create(id) {
	"use strict";

	// Create map
	COFFEESHOP_STORAGE['googlemap_init_obj'][id].map = new google.maps.Map(COFFEESHOP_STORAGE['googlemap_init_obj'][id].dom, COFFEESHOP_STORAGE['googlemap_init_obj'][id].opt);

	// Add markers
	for (var i in COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers)
		COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[i].inited = false;
	coffeeshop_googlemap_add_markers(id);

	// Add resize listener
	jQuery(window).resize(function() {
		if (COFFEESHOP_STORAGE['googlemap_init_obj'][id].map)
			COFFEESHOP_STORAGE['googlemap_init_obj'][id].map.setCenter(COFFEESHOP_STORAGE['googlemap_init_obj'][id].opt.center);
	});
}

function coffeeshop_googlemap_add_markers(id) {
	"use strict";
	for (var i in COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers) {

		if (COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[i].inited) continue;

		if (COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[i].latlng == '') {

			if (COFFEESHOP_STORAGE['googlemap_init_obj'][id].geocoder_request!==false) continue;

			if (COFFEESHOP_STORAGE['googlemap_init_obj'].geocoder == '') COFFEESHOP_STORAGE['googlemap_init_obj'].geocoder = new google.maps.Geocoder();
			COFFEESHOP_STORAGE['googlemap_init_obj'][id].geocoder_request = i;
			COFFEESHOP_STORAGE['googlemap_init_obj'].geocoder.geocode({address: COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[i].address}, function(results, status) {
				"use strict";
				if (status == google.maps.GeocoderStatus.OK) {
					var idx = COFFEESHOP_STORAGE['googlemap_init_obj'][id].geocoder_request;
					if (results[0].geometry.location.lat && results[0].geometry.location.lng) {
						COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[idx].latlng = '' + results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
					} else {
						COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[idx].latlng = results[0].geometry.location.toString().replace(/\(\)/g, '');
					}
					COFFEESHOP_STORAGE['googlemap_init_obj'][id].geocoder_request = false;
					setTimeout(function() {
						coffeeshop_googlemap_add_markers(id);
						}, 200);
				} else
					dcl(COFFEESHOP_STORAGE['strings']['geocode_error'] + ' ' + status);
			});

		} else {

			// Prepare marker object
			var latlngStr = COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[i].latlng.split(',');
			var markerInit = {
				map: COFFEESHOP_STORAGE['googlemap_init_obj'][id].map,
				position: new google.maps.LatLng(latlngStr[0], latlngStr[1]),
				clickable: COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[i].description!=''
			};
			if (COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[i].point) markerInit.icon = COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[i].point;
			if (COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[i].title) markerInit.title = COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[i].title;
			COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[i].marker = new google.maps.Marker(markerInit);

			// Set Map center
			if (COFFEESHOP_STORAGE['googlemap_init_obj'][id].opt.center == null) {
				COFFEESHOP_STORAGE['googlemap_init_obj'][id].opt.center = markerInit.position;
				COFFEESHOP_STORAGE['googlemap_init_obj'][id].map.setCenter(COFFEESHOP_STORAGE['googlemap_init_obj'][id].opt.center);
			}

			// Add description window
			if (COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[i].description!='') {
				COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[i].infowindow = new google.maps.InfoWindow({
					content: COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[i].description
				});
				google.maps.event.addListener(COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[i].marker, "click", function(e) {
					var latlng = e.latLng.toString().replace("(", '').replace(")", "").replace(" ", "");
					for (var i in COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers) {
						if (latlng == COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[i].latlng) {
							COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[i].infowindow.open(
								COFFEESHOP_STORAGE['googlemap_init_obj'][id].map,
								COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[i].marker
							);
							break;
						}
					}
				});
			}

			COFFEESHOP_STORAGE['googlemap_init_obj'][id].markers[i].inited = true;
		}
	}
}

function coffeeshop_googlemap_refresh() {
	"use strict";
	for (id in COFFEESHOP_STORAGE['googlemap_init_obj']) {
		coffeeshop_googlemap_create(id);
	}
}

function coffeeshop_googlemap_init_styles() {
	// Init Google map
	COFFEESHOP_STORAGE['googlemap_init_obj'] = {};
	COFFEESHOP_STORAGE['googlemap_styles'] = {
		'default': []
	};
	if (window.coffeeshop_theme_googlemap_styles!==undefined)
		COFFEESHOP_STORAGE['googlemap_styles'] = coffeeshop_theme_googlemap_styles(COFFEESHOP_STORAGE['googlemap_styles']);
}


// Theme-specific GoogleMap styles
//=====================================================
function coffeeshop_theme_googlemap_styles($styles) {
	"use strict";
	// Put here your theme-specific code to add GoogleMap styles
	// It will be called before GoogleMap init when page is loaded
	$styles['greyscale'] = [
    	{ "stylers": [
        	{ "saturation": -100 }
            ]
        }
	];
	$styles['inverse'] = [
		{ "stylers": [
			{ "invert_lightness": true },
			{ "visibility": "on" }
			]
		}
	];
	$styles['simple'] = [
    	{ stylers: [
        	{ hue: "#00ffe6" },
            { saturation: -20 }
			]
		},
		{ featureType: "road",
          elementType: "geometry",
          stylers: [
			{ lightness: 100 },
           	{ visibility: "simplified" }
            ]
		},
		{ featureType: "road",
          elementType: "labels",
          stylers: [
          	{ visibility: "off" }
            ]
		}
	];
	$styles['apple'] = [
		{ "featureType": "landscape.man_made",
		  "elementType": "geometry",
		  "stylers": [
			{"color":"#f7f1df"}
			]
		},
		{ "featureType": "landscape.natural",
		  "elementType": "geometry",
		  "stylers": [
		  	{"color":"#d0e3b4"}
			]
		},
		{ "featureType": "landscape.natural.terrain",
		  "elementType": "geometry",
		  "stylers": [
		  	{"visibility":"off"}
			]
		},
		{ "featureType": "poi",
		  "elementType": "labels",
		  "stylers": [
		  	{"visibility":"off"}
			]
		},
		{ "featureType": "poi.business",
		  "elementType": "all",
		  "stylers": [
		  	{"visibility":"off"}
			]
		},
		{ "featureType": "poi.medical",
		  "elementType": "geometry",
		  "stylers": [
		  	{"color":"#fbd3da"}
			]
		},
		{ "featureType": "poi.park",
		  "elementType": "geometry",
		  "stylers": [
		  	{"color":"#bde6ab"}
			]
		},
		{ "featureType": "road",
		  "elementType": "geometry.stroke",
		  "stylers": [
		  	{"visibility":"off"}
			]
		},
		{ "featureType": "road",
		  "elementType": "labels",
		  "stylers": [
		  	{"visibility":"off"}
			]
		},
		{ "featureType": "road.highway",
		  "elementType": "geometry.fill",
		  "stylers": [
		  	{"color":"#ffe15f"}
			]
		},
		{ "featureType": "road.highway",
		  "elementType":"geometry.stroke",
		  "stylers": [
		  	{"color":"#efd151"}
		  	]
		},
		{ "featureType": "road.arterial",
		  "elementType": "geometry.fill",
		  "stylers": [
		  	{"color":"#ffffff"}
			]
		},
		{ "featureType": "road.local",
		  "elementType": "geometry.fill",
		  "stylers": [
		  	{"color":"black"}
			]
		},
		{ "featureType": "transit.station.airport",
		  "elementType": "geometry.fill",
		  "stylers": [
		  	{"color":"#cfb2db"}
			]
		},
		{ "featureType": "water",
		  "elementType": "geometry",
		  "stylers": [
		  	{"color":"#a2daf2"}
			]
		}
	];
	return $styles;
}
