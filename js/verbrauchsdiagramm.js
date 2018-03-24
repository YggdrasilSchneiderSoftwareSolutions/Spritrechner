var fahrtCounter = 0;

function VerbrauchProFahrt(fahrt) {
	this.id = ++fahrtCounter;
	this.fahrzeugName = fahrt.fahrzeugName;
	this.strecke = fahrt.endKm - fahrt.startKm;
	this.liter = fahrt.liter;
}

// wie vom local Scope zum global scope?
var FinalGraphData = [];



// JSON-Object abspeichern

// Graph-Object erzeugen
var Graph = new Object;
var x = [];
var y = [];
var date = new Date();
Graph.x = x;
Graph.y = y;
Graph.type = 'bar';
// style
Graph.marker = {
			color: '#CC3333',
			line: {
					width: 1.5
			}
	};


// layout
var GraphLayout = {
	title : 'Verbrauch pro Fahrt ',
	xaxis : {
		title : 'Fahrt',
		showgrid : false,
		zeroline : false
	},
	yaxis : {
		title : 'Verbrauch in l/100km',
		showline : false
	}
};


for (var i = 0; i < response.nachricht.length; i++) {
	// in Object übergeben
	var fahrt = response.nachricht[i]; // kein JS-Object? Nur
	// final variable!

	var currentFahrt = JSON.parse(JSON.stringify(fahrt)); // "cast"
	// to object

	// Graph fuellen mit Daten
	x.push(i+1);
	y.push(100* currentFahrt.liter/(currentFahrt.endKm-currentFahrt.startKm));

}

// in Array packen für plot.ly
FinalGraphData.push(Graph);

Plotly.newPlot('realPlot', FinalGraphData, GraphLayout);


function passGraphDataToHtml() {

	var realPlot = document.getElementById('realPlot');

	// Übergebe die Graph-Daten an das HTML

	realPlot.FinalGraphData = FinalGraphData;
}



$(document).ready(function() {
	Fahrer = JSON.parse(localStorage.getItem("spritrechner_fahrer"));
	$("#btnGetStatistik").click(function(e) {
		e.preventDefault(); // keine neue Seite

		$.ajax({
			type : "POST",
			url : "php/appinterface/request_handler.php",
			data : "&action=get_statistik_verbrauch&fahrer_id=" + Fahrer.id // fahrer_id
		// aus
		// dem
		// localStorage
		// holen
		}).done(function(response) {
			response = JSON.parse(response);
			if (response.istFehler) {
				$("#loginFehler").text("FEHLER!");
			} else {
				// JSON-Object abspeichern

				// Graph-Object erzeugen
				var Graph = new Object;
				var x = [];
				var y = [];
				var date = new Date();
				Graph.x = x;
				Graph.y = y;
				Graph.type = 'bar';
				// style
				Graph.marker = {
			        color: '#CC3333',
			        line: {
			            width: 1.5
			        }
			    };


				// layout
				var GraphLayout = {
					title : 'Verbrauch pro Fahrt ',
					xaxis : {
						title : 'Fahrt',
						showgrid : false,
						zeroline : false
					},
					yaxis : {
						title : 'Verbrauch in l/100km',
						showline : false
					}
				};

				for (var i = 0; i < response.nachricht.length; i++) {
					// in Object übergeben
					var fahrt = response.nachricht[i]; // kein JS-Object? Nur
					// final variable!

					var currentFahrt = JSON.parse(JSON.stringify(fahrt)); // "cast"
					// to
					// object

					// Graph fuellen mit Daten
					x.push(i+1);
					y.push(100* currentFahrt.liter/(currentFahrt.endKm-currentFahrt.startKm));

				}

				// in Array packen für plot.ly
				FinalGraphData.push(Graph);

				Plotly.newPlot('realPlot', FinalGraphData, GraphLayout);

			}
		});
	});

});
