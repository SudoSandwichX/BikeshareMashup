import BS = require('./BikeShareBuild');
// Must call initMap to start google maps

export var forceImport;

export function initMap() {                             //create map object
    var myGeoLocationLabel = "M";
    var stationName = "Me";
    var map: google.maps.Map = new google.maps.Map(document.getElementById('map'));
    var mapOpt: google.maps.MapOptions = {};
    mapOpt.center = new google.maps.LatLng(46.8772, -96.7898);
    mapOpt.zoom = 14;
    map.setOptions(mapOpt);

    var map = new google.maps.Map(document.getElementById('map'), mapOpt);

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            var checkExist = setInterval(function () {
                if (BS.bikeShares[0].stations) {
                    console.log("Exists!");
                    clearInterval(checkExist);
                }
            }, 2000);

            BS.bikeShares[0].stations.forEach(function (station) {
                var info: BS.StationInformation = station.stationInformation;
                mapMarker(info.name, { lat: info.lat, lng: info.lon }, map, info.name, station);
            })

            var myPosition = new google.maps.LatLng(pos.lat, pos.lng);
            map.setCenter(myPosition);
        }, function () {
            handleLocationError(true, google.maps.InfoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, google.maps.InfoWindow, map.getCenter());
    }


}

function mapMarker(markerLabel, markerLocation, map, stationName, station: BS.Station) {

    var avail = station.stationStatus.num_bikes_available;
    var docks = station.stationStatus.num_docks_available;
    var total = avail + docks;

    if (station.stationStatus.is_renting != 1) {
        var image = './images/bike-icon-grey.png';
    } else if (avail < 3) {
        var image = './images/bike-icon-red.png';
    } else if (avail <= 5) {
        var image = './images/bike-icon-yellow.png';
    } else {
        var image = './images/bike-icon-green.png';
    }


    var marker = new google.maps.Marker({
        position: markerLocation,
        map: map,
        title: stationName,
        icon: image
    });

    marker.addListener('dblclick', function () {
        var m: google.maps.Map = map;
        var pos: google.maps.LatLng = markerLocation;
        m.setCenter(new google.maps.LatLng(Number(pos.lat), Number(pos.lng)));
        m.setZoom(m.getZoom() + 1);
    });

    marker.addListener('click', function () {  //listen on the button click to make the call to the station name
        var m: google.maps.Map = map;
        var pos: google.maps.LatLng = markerLocation;

        var bikeShareElem: HTMLElement = document.getElementById("title");
        bikeShareElem.childNodes[0].nodeValue = BS.bikeShares[0].name;

        var stationElem: HTMLElement = document.getElementById("station")
        stationElem.childNodes[0].nodeValue = stationName;

        var addressElem: HTMLElement = document.getElementById("address1")
        stationElem.getElementsByTagName("small")[0].innerText = "  ·  " + station.stationInformation.address;


        var col;
        if (avail < 3) {
            col = "rgb(187, 0, 0)";
        } else if (avail <= 5) {
            col = "rgb(216, 226, 91)";
        } else {
            col = "green";
        }

        var columnLeft: HTMLElement = document.getElementById("left-column-count");
        columnLeft.innerText = station.stationStatus.num_bikes_available;
        columnLeft.style.color = col;

        var col;
        if (docks < 3) {
            col = "rgb(187, 0, 0)";
        } else if (docks <= 5) {
            col = "rgb(216, 226, 91)";
        } else {
            col = "green";
        }

        var columnRightText: HTMLElement = document.getElementById("right-column-count");
        columnRightText.style.color = col;
        columnRightText.innerText = station.stationStatus.num_docks_available;


        var renting: HTMLElement = document.getElementById("rental-availability");
        renting.innerText = station.stationStatus.is_renting == 1 && avail >= 1 ? "Rentals available" : "Rentals unavailable";

        var docking: HTMLElement = document.getElementById("dock-availability");
        docking.innerText = station.stationStatus.is_returning == 1 && docks >= 1 ? "Docks available" : "Docks unavailable";


        var histogram: HTMLElement = document.getElementById("histogram");
        drawChart(histogram, station);
    })
}

function drawChart(parent: HTMLElement, station: BS.Station) {

    var data = new google.visualization.DataTable();
    data.addColumn('timeofday', 'Time of Day');
    data.addColumn('number', 'Bikes Rented');

    //[[8, 30, 45], 5],
    var rentals = new Array();
    var d: Date = new Date();
    // 30 min increments
    for (var i = 0; i < 24; i++) {
        rentals[i] = new Array();
        rentals[i].push(0);
    }

    station.history.forEach(function (e) {
        var eDate = new Date(e.CheckoutDate + " " + e.CheckoutTime);
        if (eDate.getDay() == d.getDay()) {//&& eDate.getMonth() == d.getMonth()) {
            var hour = eDate.getHours();
            if (hour)
                rentals[hour][0] += 1;
        }
    })


    for (var i = 0; i < rentals.length; i++) {
        console.log(rentals[i][0]);
        var d = new Date(rentals[i]);

        data.addRow([[i, 0, 0], rentals[i][0]]);
    }
    console.log(rentals.length);


    var options: google.visualization.ColumnChartOptions = {
        title: 'Peak Times',
        titlePosition: 'none',
        height: 300,
        width: 425,
        legend: { position: "none" },
        backgroundColor: '#292929',
        titleTextStyle: {
            color: '#f8f8f4', fontSize: 16, fontName: 'Segoe UI'
        },
        hAxis: {
            textStyle: {
                color: '#f8f8f4'
            },
            gridlines: { color: 'transparent' },
            format: 'h:mm a',
            viewWindow: {
                min: [7, 0, 0],
                max: [24, 0, 0]
            },
            viewWindowMode: 'pretty'

        },
        vAxis: {
            textStyle: {
                color: 'transparent'
            },
            gridlines: { color: 'transparent' }
        },
        tooltip: { trigger: 'none' },
        animation: {
            startup: true,
            duration: 2,
            easing: 'in'

        }
    };

    var chartDiv: HTMLElement = document.createElement("chart_div");
    chartDiv.setAttribute('class', 'col-md-6');
    chartDiv.style.marginTop = '-40px';
    chartDiv.style.paddingTop = '0px';
    var chart = new google.visualization.ColumnChart(chartDiv);
    parent.innerHTML = '';
    parent.appendChild(chartDiv);

    chart.draw(data, options);
}


function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
}
