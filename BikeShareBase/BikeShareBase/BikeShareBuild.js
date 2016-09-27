define(["require", "exports"], function (require, exports) {
    "use strict";
    class BikeShare {
        constructor(system_id, name, langauge, url, phone_number, email, timezone) {
            this.system_id = system_id;
            this.name = name;
            this.langauge = langauge;
            this.url = url;
            this.phone_number = phone_number;
            this.email = email;
            this.timezone = timezone;
            this.stations = new Array();
            this.pricingPlans = new Array();
            this.feeds = new Array();
        }
    }
    exports.BikeShare = BikeShare;
    class PricingPlans {
        constructor(price, is_taxable, url, description, currency, name, plan_id) {
            this.price = price;
            this.is_taxable = is_taxable;
            this.url = url;
            this.description = description;
            this.currency = currency;
            this.name = name;
            this.plan_id = plan_id;
        }
    }
    exports.PricingPlans = PricingPlans;
    class Station {
        constructor() {
            this.history = new Array();
        }
    }
    exports.Station = Station;
    class StationInformation {
        constructor(lon, lat, address, name, station_id) {
            this.lon = lon;
            this.lat = lat;
            this.address = address;
            this.name = name;
            this.station_id = station_id;
        }
    }
    exports.StationInformation = StationInformation;
    class StationStatus {
        constructor(station_id, num_bikes_available, num_docks_available, is_installed, is_renting, is_returning, last_reported) {
            this.station_id = station_id;
            this.num_bikes_available = num_bikes_available;
            this.num_docks_available = num_docks_available;
            this.is_installed = is_installed;
            this.is_renting = is_renting;
            this.is_returning = is_returning;
            this.last_reported = last_reported;
        }
    }
    exports.StationStatus = StationStatus;
    class BikeShareHistory {
        constructor(CheckoutDate, CheckoutStation, CheckoutTime, ReturnDate, ReturnStation, ReturnTime) {
            this.CheckoutDate = CheckoutDate;
            this.CheckoutStation = CheckoutStation;
            this.CheckoutTime = CheckoutTime;
            this.ReturnDate = ReturnDate;
            this.ReturnStation = ReturnStation;
            this.ReturnTime = ReturnTime;
        }
    }
    exports.BikeShareHistory = BikeShareHistory;
    var feeds = new Array();
    exports.bikeShares = new Array();
    class Feed {
        constructor(url, name) {
            this.url = url;
            this.name = name;
        }
    }
    exports.Feed = Feed;
    // Startup function
    function InitBikeShare() {
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
    }
    exports.InitBikeShare = InitBikeShare;
    ;
    // Parse initial data feed
    function ParseDataFeed(results) {
        results.data.en.feeds.forEach(function (feed) {
            let myFeed = new Feed(feed.url, feed.name);
            feeds.push(myFeed);
        });
        console.log("Feeds:");
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
    function buildClasses(feed, results) {
        if (results)
            var d = results.data;
        switch (feed.name) {
            case "system_information":
                console.log(feed.name);
                var bikeShare = new BikeShare(d.system_id, d.name, d.language, d.url, d.phone_number, d.email, d.timezone);
                bikeShare.feeds = feeds;
                exports.bikeShares.push(bikeShare);
                break;
            case "station_information":
                console.log(feed.name);
                d.stations.forEach(function (station) {
                    var s = new Station();
                    s.stationInformation = new StationInformation(station.lon, station.lat, station.address, station.name, station.station_id);
                    exports.bikeShares[0].stations.push(s);
                });
                console.log(exports.bikeShares[0].stations);
                break;
            case "station_status":
                console.log(feed.name);
                for (var i = 0; i < d.stations.length; i++) {
                    for (var j = i; j < exports.bikeShares[0].stations.length; j++) {
                        if (d.stations[i].station_id == exports.bikeShares[0].stations[j].stationInformation.station_id) {
                            var s = d.stations[i];
                            var status = new StationStatus(s.station_id, s.num_bikes_available, s.num_docks_available, s.is_installed, s.is_renting, s.is_returning, s.last_reported);
                            exports.bikeShares[0].stations[j].stationStatus = status;
                            break;
                        }
                    }
                }
                break;
            case "system_pricing_plans":
                console.log(feed.name);
                d.plans.forEach(function (p) {
                    var plan = new PricingPlans(p.price, p.is_taxable, p.url, p.description, p.currency, p.name, p.plan_id);
                    exports.bikeShares[0].pricingPlans.push(plan);
                });
                break;
            default:
                return;
        }
    }
    function GetDataFeed(feed) {
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
    function PrintBikeShares() {
        exports.bikeShares.forEach(function (bikeShare) {
            console.log(bikeShare.name + "\nEmail: " + bikeShare.email + "\nPhone: " + bikeShare.phone_number);
            PrintPricingPlans(bikeShare);
            PrintStations(bikeShare);
        });
    }
    exports.PrintBikeShares = PrintBikeShares;
    function PrintPricingPlans(bikeShare) {
        bikeShare.pricingPlans.forEach(function (plan) {
            console.log(plan.name + "\nPrice: " + plan.price);
        });
    }
    exports.PrintPricingPlans = PrintPricingPlans;
    function PrintStations(bikeShare) {
        bikeShare.stations.forEach(function (station) {
            console.log("Station: " + station.stationInformation.name + "\nAddress: " + station.stationInformation.address);
            var status = station.stationStatus;
            console.log("Bikes Available: " + status.num_bikes_available + "\nDocks Available: " + status.num_docks_available + "\nRenting: " + (status.is_renting == 1 ? "Yes" : "No"));
        });
    }
    exports.PrintStations = PrintStations;
});
//# sourceMappingURL=BikeShareBuild.js.map