export class BikeShare {
    stations: Station[] = new Array();
    pricingPlans: PricingPlans[] = new Array();
    feeds: Feed[] = new Array();

    constructor(public system_id, public name, public langauge, public url, public phone_number, public email, public timezone) { }
}

export class PricingPlans {
    constructor(public price, public is_taxable, public url, public description, public currency, public name, public plan_id) { }
}

export class Station {
    stationInformation: StationInformation;
    stationStatus: StationStatus;
    history: BikeShareHistory[] = new Array();
}
export class StationInformation {
    constructor(public lon, public lat, public address, public name, public station_id) { }
}
export class StationStatus {
    constructor(public station_id, public num_bikes_available, public num_docks_available, public is_installed, public is_renting, public is_returning, public last_reported) { }
}
export class BikeShareHistory {
    constructor(public CheckoutDate, public CheckoutStation, public CheckoutTime, public ReturnDate, public ReturnStation, public ReturnTime) { }
}

var feeds: Feed[] = new Array();
export var bikeShares: BikeShare[] = new Array();

export class Feed {
    constructor(public url, public name) {
    }
}


// Startup function
export function InitBikeShare() {
    //var el = document.getElementById("test");
    //el.innerHTML = "test text"
    var xmlhttp = new XMLHttpRequest();
    var url = "https://gbfs.bcycle.com/bcycle_greatrides/gbfs.json";

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var results = JSON.parse(this.responseText);
            ParseDataFeed(results);
        }
    };

    xmlhttp.open("GET", url, false);
    xmlhttp.send();

};

// Parse initial data feed
function ParseDataFeed(results) {
    results.data.en.feeds.forEach(function (feed) {
        let myFeed: Feed = new Feed(feed.url, feed.name)
        feeds.push(myFeed);
    });

    console.log("Feeds:")
    feeds.forEach(function (feed) {
        console.log(feed.name + ", " + feed.url);
    });

    RetrieveFeeds();

}

/*
Parse data feeds retrieved from gbfs.json
*/
function RetrieveFeeds() {
    feeds.forEach(function (feed) {
        GetDataFeed(feed);
    });
}

// Build out class structure from required feeds
function buildClasses(feed: Feed, results) {
    if (results)
        var d = results.data;
    switch (feed.name) {
        case "system_information":
            console.log(feed.name);

            var bikeShare = new BikeShare(d.system_id, d.name, d.language, d.url, d.phone_number, d.email, d.timezone);
            bikeShare.feeds = feeds;
            bikeShares.push(bikeShare);
            break;
        case "station_information":
            console.log(feed.name);
            d.stations.forEach(function (station) {
                var s = new Station();
                s.stationInformation = new StationInformation(station.lon, station.lat, station.address, station.name, station.station_id);
                bikeShares[0].stations.push(s);
            });
            console.log(bikeShares[0].stations);
            break;
        case "station_status":
            console.log(feed.name);
            for (var i = 0; i < d.stations.length; i++) {
                for (var j = i; j < bikeShares[0].stations.length; j++) {
                    if (d.stations[i].station_id == bikeShares[0].stations[j].stationInformation.station_id) {
                        var s = d.stations[i];
                        var status = new StationStatus(s.station_id, s.num_bikes_available, s.num_docks_available, s.is_installed, s.is_renting, s.is_returning, s.last_reported);
                        bikeShares[0].stations[j].stationStatus = status;
                        break;
                    }
                }
            }
            break;
        case "system_pricing_plans":
            console.log(feed.name);
            d.plans.forEach(function (p) {
                var plan = new PricingPlans(p.price, p.is_taxable, p.url, p.description, p.currency, p.name, p.plan_id);
                bikeShares[0].pricingPlans.push(plan);
            })
            break;
        default:
            return;
    }
}

function GetDataFeed(feed: Feed) {
    var xmlhttp = new XMLHttpRequest();
    var results;
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            results = JSON.parse(this.responseText);
            buildClasses(feed, results);
        }
    };
    xmlhttp.open("GET", feed.url, false);
    xmlhttp.send();

}

export function PrintBikeShares() {
    bikeShares.forEach(function (bikeShare) {
        console.log(bikeShare.name + "\nEmail: " + bikeShare.email + "\nPhone: " + bikeShare.phone_number);
        PrintPricingPlans(bikeShare);
        PrintStations(bikeShare);
    })
}

export function PrintPricingPlans(bikeShare: BikeShare) {
    bikeShare.pricingPlans.forEach(function (plan) {
        console.log(plan.name + "\nPrice: " + plan.price);
    })
}

export function PrintStations(bikeShare: BikeShare) {
    bikeShare.stations.forEach(function (station) {
        console.log("Station: " + station.stationInformation.name + "\nAddress: " + station.stationInformation.address);

        var status = station.stationStatus;
        console.log("Bikes Available: " + status.num_bikes_available + "\nDocks Available: " + status.num_docks_available + "\nRenting: " + (status.is_renting == 1 ? "Yes" : "No"));
    })
}

