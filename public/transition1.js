document.addEventListener('DOMContentLoaded', () => {
    console.log("hello hello fuck you")
    fetchData();
  });
  
async function fetchData() {
  const response = await fetch('/result-1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  // Get the response data as JSON
  const data = await response.json();
  
  // Redirect to the result page
  window.location.href = `/result/${data.recName}`;
};