<?php

$status = readfile('status.txt');
switch ($status) {
	case '0':
		echo "<p>黑方：空缺</p><p>白方：空缺</p>";
		echo "<form id='loginform' action='' method='post'>";
		echo "<div>请输入姓名：<input type='text' id='username' name='username' /></div>";
		echo "<input id='submit' type='submit' value='以黑方加入' />";
		echo "</form>";
		break;
	case '1':
		
		break;
	case '2':
		
		break;
}

?>