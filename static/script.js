// JavaScript code for chat functionality
const messageBox = document.getElementById('messageBox');
const userInput = document.getElementById('userInput');
const sendButton = document.querySelector('button');

// Function to add a new message to the message box
function addMessageToBox(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `<strong>${sender}: </strong>${message}`;
    messageBox.appendChild(messageElement);
    messageBox.scrollTop = messageBox.scrollHeight; // Scroll to bottom
}

// Function to handle sending a message
function sendMessage() {
    const message = userInput.value.trim();
    if (message !== '') {
        addMessageToBox('User', message);
        userInput.value = ''; // Clear input after sending
        // Check if message is 'quit'
        if (message.toLowerCase() === 'quit') {
            addMessageToBox('MediMate', 'Goodbye! Reload website to chat again...');
            userInput.disabled = true; // Disable input
            sendButton.disabled = true; // Disable send button
        } else {
            getBotResponse(message);
        }
    }
}

// Function to get response from the bot
function getBotResponse(message) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const response = xhr.responseText;
                addMessageToBox('MediMate', response);
            }
        }
    };
    xhr.open('GET', `/get?msg=${message}`, true);
    xhr.send();
}

// Event listener for send button click
sendButton.addEventListener('click', sendMessage);

// Event listener for pressing enter in the input field
userInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// JavaScript code for medicine inventory
let inventory = [];
const form = document.querySelector('.form');
const searchInput = document.getElementById('search');
const tableBody = document.getElementById('tableBody');

form.addEventListener('submit', function(event) {
  event.preventDefault();
  const name = this.querySelector('#name').value;
  const description = this.querySelector('#description').value;
  const quantity = parseInt(this.querySelector('#quantity').value, 10);
  const location = this.querySelector('#location').value.trim(); // Get storage location value and trim extra spaces
  if (name && description && !isNaN(quantity) && location) { // Check if location is provided
    inventory.push({
      name,
      description,
      quantity,
      location // Add location to inventory object
    });
    displayInventory(inventory);
    this.reset();
  } else {
    alert('Please provide valid values including Storage Location.');
  }
});


function displayInventory(data) {
  tableBody.innerHTML = '';
  data.forEach((medicine, index) => {
    const row = `<tr>
      <td>${index + 1}</td>
      <td>${medicine.name}</td>
      <td>${medicine.description}</td>
      <td>${medicine.quantity}</td>
      <td>${medicine.location}</td> <!-- Display storage location -->
      <td>
        <button class="btn-delete" onclick="deleteMedicine(${index})">Delete</button>
        <button class="btn-modify" onclick="modifyQuantity(${index})">Modify Quantity</button>
      </td>
    </tr>`;
    tableBody.insertAdjacentHTML('beforeend', row);
  });
}

function deleteMedicine(index) {
  inventory.splice(index, 1);
  displayInventory(inventory);
}

function modifyQuantity(index) {
  const newQuantity = parseInt(prompt('Enter new quantity:'), 10);
  if (!isNaN(newQuantity)) {
    inventory[index].quantity = newQuantity;
    displayInventory(inventory);
  } else {
    alert('Invalid quantity.');
  }
}

searchInput.addEventListener('input', function(event) {
  const searchTerm = event.target.value.toLowerCase().trim();
  const filteredData = inventory.filter(item => {
    return (
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm)
    );
  });
  displayInventory(filteredData);
});

// JavaScript code for reminders
var reminders = []; // Array to store reminders

function setReminder(event) {
  // Prevent default form submission behavior
  event.preventDefault();

  // Extract form data
  var reminderDate = document.getElementById("reminderDate").value;
  var reminderTime = document.getElementById("reminderTime").value;
  var reminderMessage = document.getElementById("reminderMessage").value;
  var reminderFrequency = document.getElementById("reminderFrequency").value;
  var reminderDateTime = reminderDate + " " + reminderTime;

  // Create a new reminder object
  var reminder = { time: reminderDateTime, message: reminderMessage, frequency: reminderFrequency };

  // Add the reminder to the reminders array
  reminders.push(reminder);

  // Update the reminders table
  updateRemindersTable();

  // Calculate the time difference for the reminder
  var currentTime = new Date().getTime();
  var selectedTime = new Date(reminderDateTime).getTime();
  var timeDifference = selectedTime - currentTime;

  // Calculate the timeout interval based on the selected frequency
  var interval;
  switch (reminderFrequency) {
    case "daily":
      interval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      break;
    case "hourly":
      interval = 60 * 60 * 1000; // 1 hour in milliseconds
      break;
    case "weekly":
      interval = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
      break;
    case "monthly":
      interval = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      break;
    default:
      interval = timeDifference; // Default to one-time reminder
  }

  // Set a timeout to play the alarm and repeat the reminder
  setTimeout(function () {
    playAlarm();
    speakText("Reminder: " + reminderMessage);
    if (reminderFrequency !== "") {
      // Repeat the reminder if a frequency is selected
      repeatReminder(reminder, interval);
    } else {
      // Otherwise, remove the reminder after it triggers
      removeReminder(reminder);
      updateRemindersTable();
    }
  }, timeDifference);
}

function repeatReminder(reminder, interval) {
  setInterval(function () {
    playAlarm();
    speakText("Reminder: " + reminder.message);
  }, interval);
}

function speakText(text) {
  var msg = new SpeechSynthesisUtterance();
  msg.text = text;
  window.speechSynthesis.speak(msg);
}

function removeReminder(reminder) {
  var index = reminders.indexOf(reminder);
  if (index !== -1) {
    reminders.splice(index, 1);
  }
}

function updateRemindersTable() {
  var tableBody = document.querySelector("#reminderTable tbody");
  tableBody.innerHTML = ""; // Clear existing table rows

  reminders.forEach(function (reminder, index) {
    var row = `<tr>
      <td>${reminder.time}</td>
      <td>${reminder.message}</td>
      <td>${reminder.frequency}</td>
      <td>
        <button onclick="deleteReminder(${index})">Delete</button>
        <button onclick="modifyReminder(${index})">Modify</button>
      </td>
    </tr>`;
    tableBody.innerHTML += row;
  });
}


// Function to play alarm sound
function playAlarm() {
  // Code to play alarm sound
}

// Function to delete a reminder
function deleteReminder(index) {
  reminders.splice(index, 1);
  updateRemindersTable(); // Update the table after deleting the reminder
}

// Function to modify a reminder
function modifyReminder(index) {
  var newDateTime = prompt("Enter new date and time (YYYY-MM-DD HH:MM):");
  var newMessage = prompt("Enter new reminder message:");
  
  if (newDateTime && newMessage) {
    reminders[index].time = newDateTime;
    reminders[index].message = newMessage;
    updateRemindersTable(); // Update the table after modifying the reminder
  } else {
    alert("Please provide valid date, time, and message.");
  }
}
