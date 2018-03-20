var Fahrer = {
	id: undefined,
	email: undefined
};

var fahrtCounter = 0;

function VerbrauchProFahrt(fahrt) {
	this.id = ++fahrtCounter;
	this.fahrzeugName
	this.strecke = 
	this.liter = 0;
}

// single JSON for reference 
// {"email":"test@test.de","startKm":"800.00","endKm":"1000.00","liter":"42.00","fahrzeugName":"Bentley"}

$(document).ready(function() {
	Fahrer = JSON.parse(localStorage.getItem("spritrechner_fahrer"));
	$("#btnGetStatistik").click(function(e) {
		e.preventDefault(); // keine neue Seite
		
		$.ajax({
	        type: "POST",
	        url: "php/appinterface/request_handler.php",
	        data: "&action=get_statistik_verbrauch&fahrer_id=" + Fahrer.id //fahrer_id aus dem localStorage holen
	    }).done(function(response) {
	        response = JSON.parse(response);
	        if (response.istFehler) {
	            $("#loginFehler").text("FEHLER!");
	        } else {
	        	// JSON-Object abspeichern 
	        	for(var i = 0; i <= response.nachricht.length; i++) {
	        		// in Object übergeben
//	        		var fahrt = response.nachricht[i];
//	        		
//	        		var idString = JSON.stringify(fahrt.id);
//	        		var nameString = JSON.stringify(fahrt.fahrzeugName);
	        		
	        		//console.log(idString+" "+ nameString);
	        		console.log(JSON.stringify(response.nachricht[i]))
	        	}
	      
	        }
	   });
	});
	
});