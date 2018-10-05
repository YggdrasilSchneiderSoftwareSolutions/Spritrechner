$(document).ready(function() {
	$("#btnLogin").click(function(e) {
		e.preventDefault();
		
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
	        	// JSON-Object abspeichern [0] = Fahrer, [1] = Fahrzeuge, [2] = Fahrten
	        	localStorage.setItem("spritrechner_fahrer", JSON.stringify(response.nachricht[0]));
                localStorage.setItem("fahrzeuge_list", JSON.stringify(response.nachricht[1]));
                localStorage.setItem("fahrten_list", JSON.stringify(response.nachricht[2]));
	            window.location.replace("index.html");
	        }
	   });
	});
	
	$("#btnRegistrieren").click(function(e) {
		e.preventDefault();

		var fahrer_mail = $("#fahrer_mail").val();
		var pw1 = $("#password1").val();
		var pw2 = $("#password2").val();
		
		if (emailValid(fahrer_mail) 
			&& pw1 === pw2
			&& passwordValid(pw1)) {
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
			$("#registrierungFehler").text("FEHLER: Passw\u00f6rter stimmen nicht \u00fcberein oder die eingegebenen"
				+ " Daten entsprechen nicht den Vorgaben!");
		}
	});
});

function emailValid(email) {
	return email.match("[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$");
}

function passwordValid(password) {
	return password.match("(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}");
}