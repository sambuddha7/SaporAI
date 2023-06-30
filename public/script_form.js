function handleCustomCheckboxChange(checkbox) {
    const checkboxes = document.getElementsByName(checkbox.name);
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].id !== checkbox.id) {
            checkboxes[i].checked = false;
        }
    }
}
var list = [];
function addItem() {
    var listInput = document.getElementById("list");
    var listItem = document.createElement("li");
    console.log(listInput.value);
    if (listInput.value != '') {

        var itemNumber = document.createElement("span");
        itemNumber.textContent = document.querySelectorAll(".list li").length + 1 + ". ";

        var itemText = document.createElement("span");
        itemText.textContent = listInput.value;

        var removeButton = document.createElement("button");
        removeButton.innerHTML = "&#10060;"; // Cross symbol
        removeButton.addEventListener("click", function() {
            var indexToRemove = Array.prototype.indexOf.call(listItem.parentNode.children, listItem);
            listItem.parentNode.removeChild(listItem);
            list.splice(indexToRemove, 1); // Remove the item from the list array
            updateItemNumbers();
            document.getElementById("list-data").value = JSON.stringify(list);
        });
        listItem.appendChild(itemNumber);
        listItem.appendChild(itemText);
        listItem.appendChild(removeButton);
        document.querySelector(".list").appendChild(listItem);
        list.push(listInput.value);
        listInput.value = "";

        updateItemNumbers();
        document.getElementById("list-data").value = JSON.stringify(list);
    }
}

function updateItemNumbers() {
    var listItems = document.querySelectorAll(".list li");
    listItems.forEach(function(item, index) {
        var itemNumber = item.querySelector("span:first-child");
        itemNumber.textContent = (index + 1) + ". ";
    });
}

function validateForm() {
    const mealCheckboxes = document.querySelectorAll('input[name="meal"]:checked');
    const listInput = document.getElementById("list");
    const mealError = document.getElementById("meal-error");
    const ingredientError = document.getElementById("ingredient-error");
    
    mealError.textContent = "";
    ingredientError.textContent = "";
    
    if (mealCheckboxes.length === 0) {
        mealError.textContent = "Please select at least one meal option.";
        return false;
    }

    if (list.length < 2) {
        ingredientError.textContent = "Please add at least 2 ingredients to the list.";
        return false;
    }
    return true;
}

document.addEventListener("DOMContentLoaded", function() {
  // Set the first checkbox as checked by default
  document.getElementById("breakfast-checkbox").checked = true;
  document.getElementById("savoury").checked = true;
  // Add "Enter" key event listener to submit the form
  document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      const formIsValid = validateForm();
      if (formIsValid) {
        document.querySelector(".form-group").submit();
      }
    }
  });
});

async function submitForm(event) {
    event.preventDefault(); // Prevent the default form submission behavior
  
    if (!validateForm()) {
      return;
    }
  
    // Show the loading page
    /*fetch("partials/transition")
      .then(response => response.text())
      .then(content => {
        document.getElementById('loader').innerHTML = content;
      })
      .catch(error => {
        console.error('Error fetching loading content:', error);
      });*/  
    // Collect form data
    const meal = document.querySelector('input[name="meal"]:checked').value;
    const ingredients = document.getElementById('list-data').value;
    const calories = document.getElementById('calories').value;
  
    // Make a POST request using the Fetch API
    const response = await fetch('/result-2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ meal, ingredients, calories })
    });
  
    // Get the response data as JSON
    const data = await response.json();
  
    // Redirect to the result page
    //window.location.href = `/result/${data.recName}`;
  }