"use strict"

FlightGlobal.Globe = function (opt) {
	var markers;

	var me = {
		clickableObjects:[],
		addAirportMarkers:addAirportMarkers,
		show:show,
		hide:hide,
	}

	me.object3D = new THREE.Group();

    var material    = new THREE.SpriteMaterial( { map: new THREE.TextureLoader().load('assets/texture/earth-glow.png'), transparent: true, depthWrite:false } );
    var atmosphericalSprite = new THREE.Sprite( material );
    atmosphericalSprite.scale.set(3.6,3.6);

    me.object3D.add( atmosphericalSprite );

	var globeMesh = new THREE.Mesh(
		new THREE.SphereGeometry(1, 64, 32),
		new THREE.MeshPhongMaterial({
			map: new THREE.TextureLoader().load('assets/texture/globeDiffuse_4k.png')
		})
	);

	me.object3D.add(globeMesh);
	me.object3D.rotation.x =  0.8;
	me.object3D.rotation.y = -Math.PI/2;

	addRoutes()

	me.control = new THREE.TrackballControls(me.object3D);
	me.control.dynamicDampingFactor = 0.99;

	return me;

	function addRoutes() {
		var curves = new THREE.Group();
		curves.rotation.set(0,0,0);
		curves.position.set(0,0,0);
		me.object3D.add(curves);

		var buffer;
		var segments;

		$.getJSON('assets/data/globe/globe.json', function (data) {
			segments = data;
			checkRouteData();
		})

		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'assets/data/globe/globe.bin', true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = function(e) {
			buffer = new Int16Array(this.response); 
			checkRouteData();
		};
		xhr.send();

		function checkRouteData() {
			if (!segments) return;
			if (!buffer) return;

			FlightGlobal.helper.diffDecoding(buffer, 3);

			var material;
			var materialOpacity = 0.5;
			setMaterial(materialOpacity);

			segments = segments.map(function(segment) {
				var path = [];
				var i0 = segment[0];
				var i1 = segment[1];
				for (var i = i0; i < i1; i += 3) {
					path.push(new THREE.Vector3(
						buffer[i+0]/4000,
						buffer[i+1]/4000,
						buffer[i+2]/4000,
					))
				}
				return path;
			})
			var i = 0;
			var blueMaterial= new THREE.LineBasicMaterial({
					color: '#37579b',
					transparent: true,
					premultipliedAlpha: false,
					opacity: materialOpacity
			});

			segments.forEach(function (path) {
				i++;


				var cmlgeometry = new THREE.BufferGeometry().setFromPoints(path);
				var curveObject = new THREE.Line(cmlgeometry, material);
				
				if( i > segments.length / 2 ) curveObject = new THREE.Line(cmlgeometry, blueMaterial);
				
				curves.add(curveObject);

				i++;
			})

			function setMaterial(opacity) {
				material = new THREE.LineBasicMaterial({
					color: '#C1A464',
					transparent: true,
					premultipliedAlpha: false,
					opacity: opacity,
				});
			}
		}
	}

	function show() {
		me.object3D.visible = true;
	}

	function hide() {
		me.object3D.visible = false;
	}

	function addAirportMarkers(airports) {
		markers = [];

		var markerGroup = new THREE.Group();
		me.object3D.add(markerGroup);

		me.clickableObjects = [];

		airports
		var material = new THREE.MeshPhongMaterial({
			color: 0xffff00,
			side: THREE.DoubleSide,
			transparent:true,
			opacity:0
		});
		var planeMaterial = new THREE.MeshBasicMaterial( { 
			map: new THREE.TextureLoader().load('assets/texture/freehandLines.png'), 
			transparent:true, 
			side:THREE.DoubleSide 
		});

		airports.forEach(function (airport) {
			
			var geometry = new THREE.CircleGeometry(1/90, 32);

            var planeGeometry = new THREE.PlaneGeometry( 0.025, 0.5 + Math.random() * 0.5 );
            var planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
            planeMesh.rotation.x = Math.PI / 2;

			var marker = new THREE.Mesh( geometry, material );
			marker.add( planeMesh )

			airport.lonRad = -airport.lng * Math.PI / 180;
			airport.latRad =  airport.lat * Math.PI / 180;
			var r = 1.002;

			airport.rotX = airport.latRad;
			airport.rotY = airport.lonRad-Math.PI/2;

			airport.x = r * Math.cos(airport.latRad) * Math.cos(airport.lonRad),
			airport.y = r * Math.sin(airport.latRad),
			airport.z = r * Math.cos(airport.latRad) * Math.sin(airport.lonRad)

			marker.position.set(airport.x, airport.y, airport.z);
			marker.lookAt(0,0,0);

			airport.marker = marker;
			markers.push(marker);
			markerGroup.add(marker);
		})
	}
}
