var request_access = document.getElementById("request_access");
var request_access_img = document.getElementById("request_access_img");
var log_in = document.getElementById("submit");
var request_access_src1 = "../images/request_access1.png";
var request_access_src2 = "../images/request_access2.png";
var request_access_src3 = "../images/request_access3.png";
var login_src1 = "../images/login1.png";
var login_src2 = "../images/login2.png";
var login_src3 = "../images/login3.png";

function change_src(element, new_src){
    element.setAttribute('src', new_src)
}

//image rollover for request access button
request_access.addEventListener('mouseover', function(){change_src(request_access_img, request_access_src2)}, false);
request_access.addEventListener('mouseout', function(){change_src(request_access_img, request_access_src1)}, false);
request_access.addEventListener('mousedown', function(){change_src(request_access_img, request_access_src3)}, false);

//image rollover for login button
log_in.addEventListener('mouseover', function(){change_src(log_in, login_src2)}, false);
log_in.addEventListener('mouseout', function(){change_src(log_in, login_src1)}, false);
log_in.addEventListener('mousedown', function(){change_src(log_in, login_src3)}, false);


var elUsername = document.getElementById('user');
var elMsg = document.getElementById('feedback1');
var elPassword = document.getElementById('pass');
var elMsg2 = document.getElementById('feedback2');

function checkUsername(){
if (elUsername.value.length < 7){
    elMsg.innerHTML = '<p>*Must be at least 7 characters</p>'
} else {
    elMsg.innerHTML = '';
}
}

function checkPassword(){
    var i = 0;
    if (elPassword.value.length < 7){
      elMsg2.innerHTML = '<p>*Must be at least 7 characters</p>';

    } else {
        elMsg2.innerHTML = '';
    }

}
elUsername.addEventListener('blur',checkUsername, false);
elPassword.addEventListener('blur',checkPassword, false);

function setup(){
    var textinput;
    textinput = document.getElementById('user');
    textinput.focus();
}

window.addEventListener('load', setup, false);