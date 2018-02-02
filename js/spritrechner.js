var Fahrer = {
	id: undefined,
	email: undefined
};

function Fahrzeug(bez) {
	this.id = '';
	this.bezeichnung = bez;
	this.startKM = 0;
	this.endKM = 0;
	this.liter = 0;
}

function Fahrt(fahrzeugName, startKM, endKM, liter) {
	this.fahrzeugName = fahrzeugName;
	this.startKM = startKM;
	this.endKM = endKM;
	this.liter = liter;
}
Fahrt.prototype.berechneVerbrauch = function() {
	var verbrauch = (this.liter * 100) / (this.endKM - this.startKM);
	// Ergebnis runden auf 2 Nachkommastellen
	return verbrauch.toFixed(2);
};
Fahrt.prototype.berechneStrecke = function() {
	return this.endKM - this.startKM;
};

// Globale Variablen
var fahrzeuge;
var fahrten;
var selected = undefined;
var selectedIndex = 0; // wird zum Loeschen gebraucht

$(document).ready(function() {
	Fahrer = JSON.parse(localStorage.getItem("spritrechner_fahrer"));
	// localStorage.removeItem("fahrzeuge_list");
	// localStorage.removeItem("fahrten_list");
	fahrzeuge = JSON.parse(localStorage.getItem("fahrzeuge_list"));
	fahrten = [];
	var fahrtenRaw = JSON.parse(localStorage.getItem("fahrten_list"));
	if (fahrzeuge === null || fahrzeuge == undefined) {
		fahrzeuge = [];
	}
	if (fahrtenRaw !== null || fahrtenRaw != undefined) {
		// Cast zu Fahrt, da nur normale JS Objekte
		fahrtenRaw.forEach(function(value, index) {
			fahrten.push(new Fahrt(value.fahrzeugName, value.startKM,
					value.endKM, value.liter));
		});
		// Da Aufbau der Uebersicht immer den Aktuellsten (letzten) Eintrag zuerst anzeigt,
		// muss die Liste nochmal umgedreht werden
		fahrten.reverse();
	}

	renderFahrzeuge();
	renderUebersicht();

	$("#saveNeuesFahrzeug").click(function(e) {
		var neuesFahrzeug = new Fahrzeug($("#fahrzeugName").val());
		fahrzeuge.push(neuesFahrzeug);
		localStorage.setItem("fahrzeuge_list", JSON.stringify(fahrzeuge));
		$.ajax({
	        type: "POST",
	        url: "php/appinterface/request_handler.php",
	        data: $("#formNeuesFahrzeug").serialize()
	        	+ "&fahrer_id=" + Fahrer.id
	            + "&action=insert_fahrzeug"
	    }).done(function(response) {
	        response = JSON.parse(response);
	        if (response.istFehler) {
	            $("#loginFehler").text("FEHLER: " + response.fehlerText);
	        }
	    });
		renderFahrzeuge();
	});

	$("#deleteFahrzeug").click(function(e) {
		if (confirm("Fahrzeug l\u00f6schen?")) {
			fahrzeuge.splice(selectedIndex, 1);
			// Loeschung an Backend senden. Fahrzeug wird nur auf inaktiv gesetzt
			localStorage.setItem("fahrzeuge_list", JSON.stringify(fahrzeuge));
			$.ajax({
		        type: "POST",
		        url: "php/appinterface/request_handler.php",
		        data: "fahrer_id=" + Fahrer.id
		        	+ "&fahrzeug_name=" + selected.bezeichnung
		            + "&action=delete_fahrzeug"
		    }).done(function(response) {
		        response = JSON.parse(response);
		        if (response.istFehler) {
		            $("#loginFehler").text("FEHLER: " + response.fehlerText);
		        }
		    });
			renderFahrzeuge();
		}
	});

	$("#saveDaten").click(function(e) {
		// Validierung, wenn alle Eingaben gemacht ->
		// rechnen und speichern, sonst nur in localStorage speichern
		var berechnungStarten = $("#getankt").val() != "";
		selected.startKM = $("#startKilometer").val();
		selected.endKM = $("#endKilometer").val();
		selected.liter = $("#getankt").val();
		
		if (selected.startKM == "") selected.startKM = 0;
		if (selected.endKM == "") selected.endKM = 0;
		
		var inputValid = true;
		$("#eingabeFehler").html("");
		if (!$.isNumeric(selected.startKM)) {
			$("#eingabeFehler").append('<p>Startkilometer muss nummerisch sein!');
			inputValid = false;
		}
		if (!$.isNumeric(selected.endKM)) {
			$("#eingabeFehler").append('<p>Endkilometer muss nummerisch sein!');
			inputValid = false;
		}
		
		if (berechnungStarten) {
			if (parseInt(selected.endKM) < parseInt(selected.startKM)) {
				$("#eingabeFehler").append('<p>Endkilometer muss gr&ouml;&szlig;er als Startkilometer sein!');
				inputValid = false;
			}
			
			if (inputValid) {
				var neueFahrt = new Fahrt(selected.bezeichnung,
						selected.startKM, selected.endKM,
						selected.liter);
				fahrten.push(neueFahrt);
				// Immer nur die letzten 10 Fahrten anzeigen
				if (fahrten.length == 11) {
					fahrten.splice(0, 1); // Erstes Element entfernen
				}
				localStorage.setItem("fahrten_list", JSON.stringify(fahrten));
				$.ajax({
			        type: "POST",
			        url: "php/appinterface/request_handler.php",
			        data: "fahrer_id=" + Fahrer.id
			        	+ "&fahrzeug_name=" + neueFahrt.fahrzeugName
			            + "&action=insert_fahrt"
			            + "&start_km=" + neueFahrt.startKM
			            + "&end_km=" + neueFahrt.endKM
			            + "&liter=" + neueFahrt.liter
			    }).done(function(response) {
			        response = JSON.parse(response);
			        if (response.istFehler) {
			            $("#eingabeFehler").text("FEHLER: " + response.fehlerText);
			        }
			    });
				renderFahrtAbgeschlossen(neueFahrt);
				$("#modalFahrt").modal("show");
				renderUebersicht();
				selected.startKM = selected.endKM;
				selected.endKM = 0;
				selected.liter = 0;
				// Modal nur schliessen, wenn alle Eingaben korrekt
				$("#modalDatenEingeben").modal("hide");
			}
		} 
		if (inputValid) {
			localStorage.setItem("fahrzeuge_list", JSON.stringify(fahrzeuge));
			$.ajax({
		        type: "POST",
		        url: "php/appinterface/request_handler.php",
			    data: "fahrer_id=" + Fahrer.id
			      	+ "&fahrzeug_name=" + selected.bezeichnung
		            + "&action=update_fahrzeug"
			        + "&start_km=" + selected.startKM
			        + "&end_km=" + selected.endKM
		    }).done(function(response) {
		        response = JSON.parse(response);
		        if (response.istFehler) {
			        $("#eingabeFehler").text("FEHLER: " + response.fehlerText);
			    } else {
			        $("#modalDatenEingeben").modal("hide");
			    }
			});
		}
		
	});
	
	$("#logoutLink").click(function(e) {
		if (confirm("Ausloggen?")) {
			localStorage.clear();
			window.location.replace("login.html");
		}
	});

});

function renderFahrzeuge() {
	$("#fahrzeuge").html("");

	var fahrzeugNeuButton = '';
	fahrzeugNeuButton += '<div class="col-xs-12 col-md-6 col-md-4 col-lg-4">';
	fahrzeugNeuButton += '<button type="button" class="btn btn-primary btn-block btn-main" data-toggle="modal" data-target="#modalNeuesFahrzeug">+ Neu</button>';
	fahrzeugNeuButton += '</div>';
	$("#fahrzeuge").append(fahrzeugNeuButton);

	var fahrzeugButton = '';
	fahrzeuge.forEach(function(value, index) {
		fahrzeugButton += '<div class="col-xs-12 col-md-6 col-md-4 col-lg-4">';
		fahrzeugButton += '<button type="button" class="btn btn-default btn-block btn-std" onclick="datenEingeben('
				+ index + ')">' + value.bezeichnung + '</button>';
		fahrzeugButton += '</div>';
	});
	$("#fahrzeuge").append(fahrzeugButton);
}

function renderUebersicht() {
	$("#uebersicht").html("");
	var uebersichtContent = '';
	// Aktuellste Fahrt oben -> rueckwaerts durchlaufen
	for (var i = fahrten.length - 1; i >= 0; i--) {
		var value = fahrten[i];
		uebersichtContent += '<tr>';
		uebersichtContent += '<td>' + value.fahrzeugName + '</td><td>'
				+ value.berechneStrecke() + '</td>' + '<td>' + value.liter
				+ '</td>' + '<td>' + value.berechneVerbrauch() + '</td>';
		uebersichtContent += '</tr>';
	}
	$("#uebersicht").append(uebersichtContent);
}

function renderFahrtAbgeschlossen(fahrt) {
	$("#fahrtStart").html("");
	$("#fahrtEnde").html("");
	$("#fahrtKmGesamt").html("");
	$("#fahrtEndVerbrauch").html("");
	
	$("#fahrtStart").append(fahrt.startKM);
	$("#fahrtEnde").append(fahrt.endKM);
	$("#fahrtKmGesamt").append(fahrt.berechneStrecke());
	$("#fahrtEndVerbrauch").append('<p>Verbrauch:</p>');
	$("#fahrtEndVerbrauch").append('<span class="resultVerbrauch">' + fahrt.berechneVerbrauch() + '</span>');
	$("#fahrtEndVerbrauch").append('<span>l/100 km</span>');
}

function datenEingeben(index) {
	selectedIndex = index;
	selected = fahrzeuge[index];
	// Eingabefelder an selected anpassen
	selected.startKM != 0 ? $("#startKilometer").val(selected.startKM) : $("#startKilometer").val("");
	selected.endKM != 0 ? $("#endKilometer").val(selected.endKM) : $("#endKilometer").val("");
	selected.liter != 0 ? $("#getankt").val(selected.liter) : $("#getankt").val("");

	$("#modalDatenEingeben").modal("show");
}