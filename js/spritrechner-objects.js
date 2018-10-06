/**
 * Objekte, Klassen, globale Variablen
 */

var Fahrer = {
	id: undefined,
	email: undefined
};

function Fahrzeug(bez, bike) {
	this.id = '';
	this.bezeichnung = bez;
	this.startKM = 0;
	this.endKM = 0;
	this.liter = 0;
	this.bike = bike;
}

function Fahrt(fahrzeugName, startKM, endKM, liter) {
	this.fahrzeugName = fahrzeugName;
	this.startKM = startKM;
	this.endKM = endKM;
	this.liter = liter;
}
Fahrt.prototype.berechneVerbrauch = function () {
	var verbrauch = (this.liter * 100) / (this.endKM - this.startKM);
	// Ergebnis runden auf 2 Nachkommastellen
	return verbrauch.toFixed(2);
};
Fahrt.prototype.berechneStrecke = function () {
	return this.endKM - this.startKM;
};

// Globale Variablen
var fahrzeuge;
var fahrten;
var selected = undefined;
var selectedIndex = 0; // wird zum Loeschen gebraucht
var selectedStatistik;
