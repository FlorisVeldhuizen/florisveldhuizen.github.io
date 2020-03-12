<?php
	if(!empty($_POST['data'])){
		$data = $_POST['data'];
		//$fname = "json.txt";
		$fname = $_GET['name']; // get the name of the filder through the http get request


		$file = fopen($fname, 'w');//creates new file
		fwrite($file, $data);
		fclose($file);
	}
?>
