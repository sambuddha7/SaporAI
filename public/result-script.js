
function formatNutri(text) {
    // Split the text into individual lines
    const lines = text.split('\n');
  
    // Remove empty lines
    const nonEmptyLines = lines.filter(line => line.trim() !== '');
  
    // Create an unordered list
    const ul = document.createElement('ul');
  
    // Iterate over the lines and create list items
    for (let i = 1; i < nonEmptyLines.length; i++) {
      const trimmedLine = nonEmptyLines[i].trim();
      // Split the line into key and value
      const [key, value] = trimmedLine.split(':');
  
      // Create a list item element
      const li = document.createElement('li');
      
      // Set the text content of the list item
      li.textContent = `${key.trim()}: ${value.trim()}`;
      li.textContent = li.textContent.substring(1);
      // Append the list item to the unordered list
      ul.appendChild(li);
      
    }
    // Return the formatted unordered list
    return ul;
  }
//   const nutri =  "hi";
//   console.log(nutri);
  const container = document.getElementById("nutr-container");
// //   console.log(container);

//   container.appendChild(formatNutri(nutri));