document.getElementById('regenerate-btn').addEventListener('click', function () {
    if (document.getElementById("last_ai").value == 2) {
      window.location.href = "/tr"; 
    } else if (document.getElementById("last_ai").value == 1){
      window.location.href = "/tr1"; 
    } 
});
if (document.getElementById("last_ai").value == 3){
  document.getElementById('regenerate-btn').style.display = 'none';
}