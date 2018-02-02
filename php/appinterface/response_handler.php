<?php
class ResponseHandler {
	public $istFehler;
	public $fehlerText;
	public $nachricht;

	private function __construct($nachricht, $istFehler=false, $fehlerText="") {
		$this->nachricht = $nachricht;
		$this->istFehler = $istFehler;
		$this->fehlerText = $fehlerText;
	}

	public static function fehler($fehlerText) {
		$instance = new self("", true, $fehlerText);
		return json_encode($instance);
	}

	public static function erfolg($nachricht) {
		$instance = new self($nachricht);
		return json_encode($instance);
	}
}