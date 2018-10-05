<?php
include '../util/db_access_manager.php';
include '../appinterface/response_handler.php';

class UserService extends DBAccessManager {
	const INSERT_USER = "INSERT INTO Fahrer (id, email, passwort) VALUES (?, ?, ?)";
	
	const SELECT_USER = "SELECT
							f.id,
    						f.email,
    						fz.id AS fahrzeug_id,
    						fz.fahrzeug_name,
    						fz.start_km,
    						fz.end_km
						FROM Fahrer f
						LEFT JOIN Fahrzeuge fz ON f.id = fz.fahrer_id
						WHERE f.id = ?
						AND f.passwort = ?
						AND (fz.aktiv IS NULL OR fz.aktiv = 'J')";
	
	const INSERT_VEHICLE = "INSERT INTO Fahrzeuge 
                               (fahrer_id, fahrzeug_name, start_km, end_km, aktiv) 
                            VALUES (?, ?, ?, ?, ?)";
	
	const INSERT_FAHRT = "INSERT INTO Fahrten
							   (fahrer_id, fahrzeug_name, start_km, end_km, liter, zeit)
						  VALUES (?, ?, ?, ?, ?, current_timestamp())";
	
	const UPDATE_VEHICLE = "UPDATE Fahrzeuge f SET 
							   f.start_km = ?, 
							   f.end_km = ? 
							WHERE f.fahrer_id = ? 
							AND f.fahrzeug_name = ?";
	
	const SELECT_FAHRTEN = "SELECT
    							f.fahrzeug_name,
    							f.start_km,
    							f.end_km,
    							f.liter
							FROM Fahrten f
							JOIN Fahrzeuge fz ON f.fahrer_id = fz.fahrer_id
							WHERE f.fahrer_id = ?
							AND fz.aktiv = 'J'
			                AND f.fahrzeug_name = fz.fahrzeug_name
							ORDER BY f.zeit DESC 
							LIMIT 10";
	
	const DELETE_VEHICLE = "UPDATE Fahrzeuge fz
							SET fz.aktiv = 'N'
							WHERE fz.fahrer_id = ?
							AND fz.fahrzeug_name = ?";
							
    const SELECT_STATISTIK_VERBRAUCH = 
    					"SELECT
							u.email,
						    f.start_km,
						    f.end_km,
							f.liter,
							f.zeit,
						    a.fahrzeug_name
						FROM
							Fahrer u
						    JOIN 
						    Fahrten f 
						    	ON u.id = f.fahrer_id
						    JOIN
						    Fahrzeuge a 
						    	ON a.fahrzeug_name = f.fahrzeug_name
						WHERE
							u.id = ?
							AND a.aktiv = 'J'
							AND a.id = ?
						";							
	
	function __construct() {
		parent::__construct();
	}
	
	public function registrieren($email, $passwort) {
		$con = parent::getConnection();
		if(!$con) {
			return ResponseHandler::fehler("DB-Fehler: cannot connect");
		}
	
		// ID erstellen
		$sec_id = md5($email, false);
	
		$stmt = $con->prepare(self::INSERT_USER);
		if (!$stmt->bind_param("sss", $sec_id, $email, $passwort)) {
			return ResponseHandler::fehler($stmt->error);
		}
	
		if (!$stmt->execute()) {
			return ResponseHandler::fehler($stmt->error);
		}
	
		$stmt->close();
		$con->close();
		return ResponseHandler::erfolg($sec_id);
	}
	
	public function login($email, $passwort) {
		$con = parent::getConnection();
		if (!$con) {
			return ResponseHandler::fehler("DB-Fehler: cannot connect");
		}
		
		$id = md5($email, false);
		$stmt = $con->prepare(self::SELECT_USER);
		$stmt->bind_param("ss", $id, $passwort);
		
		$stmt->execute();
		$stmt->store_result();
		$rows = $stmt->num_rows;
		
		if ($rows < 1) {
			return ResponseHandler::fehler("Benutzername/Passwort nicht korrekt");
		}
		
		if (!$stmt->bind_result($id, $email, $fahrzeug_id, $fahrzeug_name, 
				$start_km, $end_km)) {
			return ResponseHandler::fehler($stmt->error);
		}
		
		$stmt->fetch(); // erste Zeile
		// einmal die Personendaten holen
		$fahrer = array(
				"id" => $id,
				"email" => $email,
		);
		
		$fahrzeuge = array();
		// fuer jede Fahrzeugzeile ein array, namen muessen denen im Client entsprechen!
		for ($i = 0; $i < $rows; $i++) {
			if ($fahrzeug_id == null) { // Falls kein Auto vorhanden -> NULL wegen JOIN
				break;
			}
			$fahrzeug = array(
				"id" => strval($fahrzeug_id),
				"bezeichnung" => $fahrzeug_name,
				"startKM" => $start_km,
				"endKM" => $end_km
			);
			
			array_push($fahrzeuge, $fahrzeug); // hinten anhaengen
			$stmt->fetch(); // naechste Zeile
		}
		
		// Fahrten holen
		$fahrten = $this->loadFahrten($id);
		
		// Endergebnis
		$result = array(
				"fahrer" => $fahrer,
				"fahrzeuge" => $fahrzeuge,
				"fahrten" => $fahrten
		);
		
		$result = array_values($result); // fuers JS
		return ResponseHandler::erfolg($result);
	}
	
	public function insertFahrzeug($fahrer_id, $fahrzeug_name) {
		$start_km = 0.0;
		$end_km = 0.0;
		$aktiv = 'J';
		
		$con = parent::getConnection();
		if(!$con) {
			return ResponseHandler::fehler("DB-Fehler: cannot connect");
		}
		
		$stmt = $con->prepare(self::INSERT_VEHICLE);
		if (!$stmt->bind_param("ssdds", $fahrer_id, $fahrzeug_name, $start_km, $end_km, $aktiv)) {
			return ResponseHandler::fehler($stmt->error);
		}
		
		if (!$stmt->execute()) {
			return ResponseHandler::fehler($stmt->error);
		}
		
		$stmt->close();
		$con->close();
		return ResponseHandler::erfolg("Fahrzeug gespeichert");
	}
	
	public function insertFahrt($fahrer_id, $fahrzeug_name, $start_km, $end_km, $liter) {
		$con = parent::getConnection();
		if(!$con) {
			return ResponseHandler::fehler("DB-Fehler: cannot connect");
		}
		
		$stmt = $con->prepare(self::INSERT_FAHRT);
		if (!$stmt->bind_param("ssddd", $fahrer_id, $fahrzeug_name, $start_km, $end_km, $liter)) {
			return ResponseHandler::fehler($stmt->error);
		}
		
		if (!$stmt->execute()) {
			return ResponseHandler::fehler($stmt->error);
		}
		
		$stmt->close();
		$con->close();
		return ResponseHandler::erfolg("Fahrt gespeichert");
	}
	
	public function updateFahrzeug($fahrer_id, $fahrzeug_name, $start_km, $end_km) {
		$con = parent::getConnection();
		if(!$con) {
			return ResponseHandler::fehler("DB-Fehler: cannot connect");
		}
		
		$stmt = $con->prepare(self::UPDATE_VEHICLE);
		if (!$stmt->bind_param("ddss", $start_km, $end_km, $fahrer_id, $fahrzeug_name)) {
			return ResponseHandler::fehler($stmt->error);
		}
		
		if (!$stmt->execute()) {
			return ResponseHandler::fehler($stmt->error);
		}
		
		$stmt->close();
		$con->close();
		return ResponseHandler::erfolg("Fahrzeug geaendert");
	}
	
	private function loadFahrten($fahrer_id) {
		$fahrten = array();
		
		$con = parent::getConnection();
		if (!$con) {
			return ResponseHandler::fehler("DB-Fehler: cannot connect");
		}
		
		$stmt = $con->prepare(self::SELECT_FAHRTEN);
		$stmt->bind_param("s", $fahrer_id);
		
		$stmt->execute();
		$stmt->store_result();
		$rows = $stmt->num_rows;
		
		if ($rows > 0) {
			if (!$stmt->bind_result($fahrzeug_name, $start_km, $end_km, $liter)) {
				return ResponseHandler::fehler($stmt->error);
			}
			
			// fuer jede Fahrzeugzeile ein array, namen muessen denen im Client entsprechen!
			$stmt->fetch(); // erste Zeile
			for ($i = 0; $i < $rows; $i++) {
				$fahrt = array(
						"fahrzeugName" => $fahrzeug_name,
						"startKM" => $start_km,
						"endKM" => $end_km,
						"liter" => $liter
				);
				array_push($fahrten, $fahrt); // hinten anhaengen
				$stmt->fetch(); // naechste Zeile
			}
		}
		
		return $fahrten;
	}
	
	public function deleteFahrzeug($fahrer_id, $fahrzeug_name) {
		$con = parent::getConnection();
		if(!$con) {
			return ResponseHandler::fehler("DB-Fehler: cannot connect");
		}
		
		$stmt = $con->prepare(self::DELETE_VEHICLE);
		if (!$stmt->bind_param("ss", $fahrer_id, $fahrzeug_name)) {
			return ResponseHandler::fehler($stmt->error);
		}
		
		if (!$stmt->execute()) {
			return ResponseHandler::fehler($stmt->error);
		}
		
		$stmt->close();
		$con->close();
		return ResponseHandler::erfolg("Fahrzeug auf inaktiv gesetzt");
	}
	
	public function selectStatistikVerbrauch($fahrer_id, $fahrzeug_id) {
		$fahrten = array();
		
		$con = parent::getConnection();
		if (!$con) {
			return ResponseHandler::fehler("DB-Fehler: cannot connect");
		}
		
		$stmt = $con->prepare(self::SELECT_STATISTIK_VERBRAUCH);
		$stmt->bind_param("si", $fahrer_id, $fahrzeug_id);
		
		$stmt->execute();
		$stmt->store_result();
		$rows = $stmt->num_rows;
		
		if ($rows > 0) {
			if (!$stmt->bind_result($email, $start_km, $end_km, $liter, $zeit, $fahrzeug_name)) {
				return ResponseHandler::fehler($stmt->error);
			}
			
			// fuer jede Fahrzeugzeile ein array, namen muessen denen im Client entsprechen!
			$stmt->fetch(); // erste Zeile
			for ($i = 0; $i < $rows; $i++) {
				$fahrt = array(
						"email" => $email,
						"startKm" => $start_km,
						"endKm" => $end_km,
						"liter" => $liter,
						"zeit" => $zeit,
						"fahrzeugName" => $fahrzeug_name
				);
				array_push($fahrten, $fahrt); // hinten anhaengen
				$stmt->fetch(); // naechste Zeile
			}
		}
		
		$result = array_values($fahrten);
		return ResponseHandler::erfolg($result);
	}
	
}