let today = new Date();
let month = today.toLocaleString('default', { month: 'long' });
let date = today.getDate();
let formattedDate = month + ', ' + date;
document.getElementById("date").textContent = formattedDate;



