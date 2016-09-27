import BS = require('./BikeShareBuild');
import gMaps = require('./GoogleMaps');
/// <reference path="jquery.d.ts" />
import pastData = require('./PastData');

gMaps.forceImport;
BS.InitBikeShare();

window.setTimeout(gMaps.initMap(), 2000);
google.charts.load('current', { 'packages': ['corechart'] });

pastData.forceImport;

/*
document.getElementById("btn").onclick = function () {
    BS.PrintBikeShares();
}
*/