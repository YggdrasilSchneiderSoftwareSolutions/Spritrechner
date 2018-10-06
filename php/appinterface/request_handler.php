<?php
include '../service/user_service.php';

if($_SERVER['REQUEST_METHOD'] == 'POST') {
	$action = $_POST['action'];
	switch ($action) {
		case 'register':
			register();
			break;
		case 'login':
			login();
			break;
		case 'insert_fahrzeug':
			insert_fahrzeug();
			break;
		case 'update_fahrzeug':
			update_fahrzeug();
			break;
		case 'insert_fahrt':
			insert_fahrt();
			break;
		case 'delete_fahrzeug':
			delete_fahrzeug();
			break;
		case 'get_statistik_verbrauch':
			get_statistik_verbrauch();
			break;
		default:
			echo 'Fehler';
	} 
}

function register() {
	$fahrer_mail = $_POST['fahrer_mail'];
	$fahrer_password = $_POST['fahrer_pw'];
	
	$userService = new UserService();
	echo $userService->registrieren($fahrer_mail, $fahrer_password);
}

function login() {
	$login_mail = $_POST['login_mail'];
	$login_password = $_POST['login_pw'];
	
	$userService = new UserService();
	echo $userService->login($login_mail, $login_password);
}

function insert_fahrzeug() {
	$fahrer_id = $_POST['fahrer_id'];
	$fahrzeug_name = $_POST['fahrzeug_name'];
	$bike = $_POST['bike'];
	
	$userService = new UserService();
	echo $userService->insertFahrzeug($fahrer_id, $fahrzeug_name, $bike);
}

function update_fahrzeug() {
	$fahrer_id = $_POST['fahrer_id'];
	$fahrzeug_name = $_POST['fahrzeug_name'];
	$start_km = $_POST['start_km'];
	$end_km = $_POST['end_km'];
	
	$userService = new UserService();
	echo $userService->updateFahrzeug($fahrer_id, $fahrzeug_name, $start_km, $end_km);
}

function insert_fahrt() {
	$fahrer_id = $_POST['fahrer_id'];
	$fahrzeug_name = $_POST['fahrzeug_name'];
	$start_km = $_POST['start_km'];
	$end_km = $_POST['end_km'];
	$liter = $_POST['liter'];
	
	$userService = new UserService();
	echo $userService->insertFahrt($fahrer_id, $fahrzeug_name, $start_km, $end_km, $liter);
}

function delete_fahrzeug() {
	$fahrer_id = $_POST['fahrer_id'];
	$fahrzeug_name = $_POST['fahrzeug_name'];
	
	$userService = new UserService();
	echo $userService->deleteFahrzeug($fahrer_id, $fahrzeug_name);
}

function get_statistik_verbrauch() {
	$fahrer_id = $_POST['fahrer_id'];
	$fahrzeug_id = $_POST['fahrzeug_id'];
	
	$userService = new UserService();
	echo $userService->selectStatistikVerbrauch($fahrer_id, $fahrzeug_id);
}
