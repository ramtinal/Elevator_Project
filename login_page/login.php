<?php
session_start();
$username = $_POST['username'];
$password = $_POST['password'];

if($username == "username"&&$password=="password"){
    $_SESSION['username']=$username;
    require '../index_page/index.php';
    require'../login_page/sucess_LI.html';
    echo "<p>Congratulations, you are now logged in</p>";
    echo '<a href="member.php">Click here</a>';
}
else{
    require '../login_page/login.html';
    require '../login_page/fail_LI.html';
}
?>