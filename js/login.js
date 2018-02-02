$(document).ready(function() {
	$("#btnLogin").click(function(e) {
		e.preventDefault();
		var fahrer_mail = $("#login_mail").val();
		var password = $("#login_pw").val();
		$.ajax({
	        type: "POST",
	        url: "php/appinterface/request_handler.php",
	        data: $("#formLogin").serialize() +
	            "&action=login"
	    }).done(function(response) {
	        response = JSON.parse(response);
	        if (response.istFehler) {
	            $("#loginFehler").text("FEHLER: Benutzer/Passwort nicht korrekt!");
	        } else {
	        	// JSON-Object abspeichern [0] = Fahrer, [1] = Fahrzeuge
	        	localStorage.setItem("spritrechner_fahrer", JSON.stringify(response.nachricht[0]));
                localStorage.setItem("fahrzeuge_list", JSON.stringify(response.nachricht[1]));
                localStorage.setItem("fahrten_list", JSON.stringify(response.nachricht[2]));
                console.log(JSON.stringify(response.nachricht[2]));
	            window.location.replace("index.html");
	        }
	   });
	});
	
	$("#btnRegistrieren").click(function(e) {
		e.preventDefault();
		var fahrer_mail = $("#fahrer_mail").val();
		var pw1 = $("#password1").val();
		var pw2 = $("#password2").val();
		if (pw1 === pw2) {
			$.ajax({
	            type: "POST",
	            url: "php/appinterface/request_handler.php",
	            data: $("#formRegistrierung").serialize() +
	                "&action=register"
	        }).done(function(response) {
	            response = JSON.parse(response);
	            if (response.istFehler) {
	                $("#registrierungFehler").text("FEHLER: " + response.fehlerText);
	            } else {
	                var fahrer = {};
	                fahrer.id = response.nachricht;
	                fahrer.email = $("#fahrer_mail").val();
	                localStorage.setItem("spritrechner_fahrer", JSON.stringify(fahrer));
	                window.location.replace("index.html");
	            }
	        });
		} else {
			$("#registrierungFehler").text("FEHLER: Passwörter stimmen nicht überein!");
		}
	});
});