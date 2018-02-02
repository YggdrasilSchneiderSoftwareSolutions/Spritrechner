<?php
require 'config.php';
/**
 * Handling fuer Datenbankverbindung
 */
class DBAccessManager {
	private $servername;
	private $username;
	private $password;
	private $dbname;

	function __construct() {
		// Connection-Properties holen
		$this->servername = SERVERNAME;
		$this->username = DB_USER;
		$this->password = DB_PASSWORD;
		$this->dbname = DB_NAME;
	}

	/**
	 *
	 * @return DB-Verbindung
	 */
	public function getConnection() {
		$conn = new mysqli($this->servername, $this->username, $this->password, $this->dbname);

		// Check connection
		if ($conn->connect_error) {
			die ("Connection failed: " . $conn->connect_error);
			return null;
		}

		return $conn;
	}
}