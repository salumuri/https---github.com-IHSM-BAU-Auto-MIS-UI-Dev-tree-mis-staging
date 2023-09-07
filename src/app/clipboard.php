<?php

session_start();
  
?>

<html>
<head>
</head>
<body>
<span class=mono id="theList" value="Hello World">
		Hello world
</span>

<script>
function copyToClipboardWithJavascript() {
  /* Get the text field */
  var copyText = document.getElementById("theList");
  /* Select the text field */
  copyText.select();
  /* Copy the text inside the text field */
  document.execCommand("copy");
}
</script>

<button onclick="copyToClipboardWithJavascript()">Click here</button>

</span>
</body>
</html>