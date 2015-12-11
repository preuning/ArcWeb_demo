date = null;
septaJSON = null;
markers = [];

trainData = [];

$(function () {

/*
    $.ajax(getSeptaParams()).done(function(o) {
*/
        septaJSON = JSON.parse(o);

        $.each(septaJSON, function (key, val) {
            date = key;

            $.each(val, function (key2, val2) {
                $.each(val2, function (key3, val3) {
                    $.each(val3, function (key4, val4) {
                        trainNumber = val4.label
                        lat = val4.lat;
                        lng = val4.lng;
                        direction = val4.Direction;
                        destination = val4.destination;
                        trainData[trainNumber] = {lat:lat,lng:lng,direction:direction,destination:destination}
		            });
                });
            });
	    });

        var trainSelect = $('#train_number');
        trainList = [];
        for (var train in trainData) {
            direction = trainData[train].direction;
            destination = trainData[train].destination;
            optValue = direction + " to " + destination + " (" + train + ")";
 
            if (direction != null && destination != null) {
                trainList.push(optValue);
                //trainSelect.append($('<option></option>').val(train).html(optValue));
            }
	    }
        $("#train_number").autocomplete({ source: trainList });

        try {
            init_gmap();
        } catch (err) {
        }

//    });


});

function getSeptaParams(start, end){
	var septaParams = {
		type:"POST",
		url: "quickTest.php"
	}
	
	return septaParams;
}

function init_gmap() {

    /* Called when page is first loaded */

        var mapCanvas = document.getElementById('map_area');
        var mapOptions = {
            center: new google.maps.LatLng(40.102139, -75.027145),
            zoom: 12,
            minZoom: 10,
            draggable: true,
            //mapTypeId: google.maps.MapTypeId.SATELLITE,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            },
            styles: 
            [{
                featureType: "all",
                elementType: "labels",        
                stylers: [
                    { visibility: "off" }
                ]
            }],
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.LEFT_TOP
            },
            streetViewControlOptions: {
                position: google.maps.ControlPosition.LEFT_TOP
            }            
        }
    
        map = new google.maps.Map(mapCanvas, mapOptions);

        var markerSize = { x: 22, y: 40 };

        google.maps.Marker.prototype.setLabel = function(label) {

        markerStyle = "map-marker-label city-zoom-in";

        if (label == null) {
            this.label.text = "";
	} else {
            this.label = new MarkerLabel({
                map: this.map,
                marker: this,
                text: label
            });
            this.label.div.className = markerStyle;
	}
        this.label.bindTo('position', this, 'position');
    };

    var MarkerLabel = function(options) {
        this.setValues(options);
        this.div = document.createElement('div');
    };

    MarkerLabel.prototype = $.extend(new google.maps.OverlayView(), {
        onAdd: function() {
            this.getPanes().overlayImage.appendChild(this.div);
            var self = this;
            this.listeners = [
		google.maps.event.addListener(this, 'position_changed', function() { self.draw();    })];
        },
        draw: function() {
            var text = String(this.get('text'));
            var position = this.getProjection().fromLatLngToDivPixel(this.get('position'));
            this.div.innerHTML = text;
            this.div.style.left = (position.x - (markerSize.x / 2)) - (text.length * 3) + 10 + 'px';
            this.div.style.top = (position.y - markerSize.y + 40) + 'px';
        }
    });

    infoWindow = new google.maps.InfoWindow({
        content:'',
	disableAutoPan: true		
    });                
    infoWindowPersist = new google.maps.InfoWindow({
	disableAutoPan: true
    });

    geocoder = new google.maps.Geocoder();
} 

function changeLocation() {
    trainSelected = $('#train_number').val();

    leftParenPos = trainSelected.indexOf('(') + 1;
    rightParenPos = trainSelected.indexOf(')');
    trainNumber = trainSelected.substring(leftParenPos, rightParenPos);

    lat = parseFloat(trainData[trainNumber].lat);
    lng = parseFloat(trainData[trainNumber].lng);
    direction = trainData[trainNumber].direction;
    destination = trainData[trainNumber].destination;
    
    showLatLng(lat, lng, direction + " to " + destination);
}

function centerOnZipCode(zipCode){
    geocoder.geocode( { 'address': zipCode}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            latlng = results[0].geometry.location;
            console.log (latlng);
            map.setCenter(latlng);
            map.setZoom(7);
            //infoWindow.close();
            infoWindowPersist.setContent('<strong>' + results[0].formatted_address + '</strong>');
	    infoWindowPersist.setPosition(latlng);
            infoWindowPersist.open(map);
        } else {
            //alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

function showLatLng(latParam, lngParam, labelParam) {

/*
    for (markerIndex = 0; markerIndex < markers.length; markerIndex++) {
        markers[markerIndex].setLabel(null);
        markers[markerIndex].setMap(null);
    }
    markers = [];
*/

    var latlng = {lat: latParam, lng: lngParam};
    var image = "Transport-Train-icon.png";

    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        icon: image,
        label: labelParam
    });

    markers.push(marker);

    map.setCenter(latlng);

/* 
    infoWindowPersist.setContent('<strong>Lat: ' + trainData[trainNumber].lat + ' Lng: ' + trainData[trainNumber].lng + '</strong>');
    infoWindowPersist.setPosition(latlng);
    infoWindowPersist.open(map);
*/

}

function clearMap() {

    for (markerIndex = 0; markerIndex < markers.length; markerIndex++) {
        markers[markerIndex].setLabel(null);
        markers[markerIndex].setMap(null);
    }
    markers = [];

}