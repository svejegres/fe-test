<?php

// for demo purposes response is always positive:
if (isset($_POST)) {
  $response = array(
    'sent' => 'true'
  );

  echo(json_encode($response));
  exit();
}