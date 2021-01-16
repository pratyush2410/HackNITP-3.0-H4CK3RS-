function saveDetails() {
	document.getElementById("street").disabled = true;
	document.getElementById("phone").disabled = true;
	document.getElementById("Email").disabled = true;
	document.getElementById("zip").disabled = true;
	document.getElementById("additional").disabled = true;
	document.getElementById("code").disabled = true;
	document.getElementById("birthday").disabled = true;
	document.getElementById("first_name").disabled = true;
	document.getElementById("last_name").disabled = true;
	document.getElementById("title").disabled = true;
	document.getElementById("country").disabled = true;
	document.getElementById("gender").disabled = true;
	document.getElementById("city").disabled = true;
	document.getElementById("edit").disabled = false;
    document.getElementById("save").disabled = true;
	document.getElementById("changepwd").disabled = true;
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");

	}


	function editDetails() {
	document.getElementById("street").disabled = false;
	document.getElementById("phone").disabled = false;
	document.getElementById("Email").disabled = false;
	document.getElementById("zip").disabled = false;
	document.getElementById("additional").disabled = false;
	document.getElementById("code").disabled = false;
	document.getElementById("birthday").disabled = false;
	document.getElementById("first_name").disabled = false;
	document.getElementById("last_name").disabled = false;
	document.getElementById("title").disabled = false;
	document.getElementById("country").disabled = false;
	document.getElementById("gender").disabled = false;
	document.getElementById("city").disabled = false;
	document.getElementById("edit").disabled = true;
	document.getElementById("save").disabled = false;
	document.getElementById("changepwd").disabled = false;
	}

var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("changepwd");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
//Matching or non matching password show
var check = function() {
	if (document.getElementById('newpwd').value ==
	  document.getElementById('newpwd2').value) {
	  document.getElementById('pwdmessage').style.color = 'green';
	  document.getElementById('pwdmessage').innerHTML = 'matching';
	} else {
	  document.getElementById('pwdmessage').style.color = 'red';
	  document.getElementById('pwdmessage').innerHTML = 'not matching';
	}
  }
