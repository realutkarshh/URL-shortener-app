let shortenedUrl; // Declare a global variable to store the shortened URL
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

function calculateTimeDifference(time) {
    const currentTime = new Date();
    const urlTime = new Date(time);
    const timeDifference = currentTime - urlTime;

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    } else if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
}


// Add this function to script.js
// Update the addToHistory function
function addToHistory(originalUrl, shortenedUrl) {
    const historyItem = {
        originalUrl,
        shortenedUrl,
        time: new Date().toString() // Save the current time as a string
    };
    let history = JSON.parse(localStorage.getItem('urlShortenerHistory')) || [];
    history.unshift(historyItem);
    localStorage.setItem('urlShortenerHistory', JSON.stringify(history));
}



function clearHistory() {
    localStorage.removeItem('urlShortenerHistory');
    updateHistoryList(); // Update the displayed history list
}

function updateHistoryList() {
    const history = JSON.parse(localStorage.getItem('urlShortenerHistory')) || [];
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    history.forEach((item, index) => {
        const listItem = document.createElement('div');
        listItem.innerHTML = `
            <a href="#" class="list-group-item list-group-item-action" aria-current="true">

            <div class="d-flex w-100 justify-content-between">

            <h5 href="${item.originalUrl}" class="mb-1">Shortened URL: ${item.shortenedUrl}</h5>
            <button class="btn btn-dark btn-sm ms-2" onclick="removeFromHistory(${index})">
            <span class="material-symbols-outlined">delete</span>
            </button>
            
            </div>
            
            <div class="d-flex w-100 justify-content-between">
            
            <p class="mb-1">Original URL: ${item.originalUrl}</p>
            
            </div>
            <small>${calculateTimeDifference(item.time)}</small>

            </a>
        `;
        historyList.appendChild(listItem);
    });
}

function removeFromHistory(index) {
    let history = JSON.parse(localStorage.getItem('urlShortenerHistory')) || [];
    history.splice(index, 1);
    localStorage.setItem('urlShortenerHistory', JSON.stringify(history));
    updateHistoryList(); // Update the displayed history list
}

// Modify shortenUrl function to add to history
async function shortenUrl() {
    const originalUrl = document.getElementById('originalUrl').value;
    const url = 'https://url-shortener-service.p.rapidapi.com/shorten';

    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': '2a93d0c867mshc1f6107d9b9294ep109e6bjsn3d1e3267947b',
            'X-RapidAPI-Host': 'url-shortener-service.p.rapidapi.com'
        },
        body: new URLSearchParams({
            url: originalUrl
        })
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        shortenedUrl = result.result_url; // Store the shortened URL in the global variable
        document.getElementById('shortenedUrl').innerHTML = `<div class="alert alert-secondary mt-3 float-in" role="alert">
        <div class="d-flex justify-content-between align-items-center">
          <span>${shortenedUrl}</span>
          <button class="btn btn-dark btn-sm" onclick="copyToClipboard('${shortenedUrl}')" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Copy">
          <span class="material-symbols-outlined" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Copy">
          content_copy
          </span>
          </button>
          <button class="btn btn-dark btn-sm" onclick="shareUrl()" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Share">
          <span class="material-symbols-outlined" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Share">
          share
          </span>
          </button>

        </div>
      </div>`;

        // Add the URL to the search history
        addToHistory(originalUrl, shortenedUrl);

        // Show the "Generate QR code" button
        document.getElementById('flipButton').style.display = 'block';

        // Reset error message and styling
        document.getElementById('errorContainer').innerHTML = '';
        document.getElementById('originalUrl').classList.remove('shake');
    } catch (error) {
        console.error(error);
        shortenedUrl = undefined; // Reset shortenedUrl in case of an error
        document.getElementById('shortenedUrl').innerHTML = ''; // Clear shortened URL container
        document.getElementById('errorContainer').innerHTML = '<p class="text-danger mt-2">Please Enter a valid URL!</p>';
        document.getElementById('originalUrl').classList.add('shake');

        // Hide the "Generate QR code" button if there's an error
        document.getElementById('flipButton').style.display = 'none';
    }

    // Update the displayed history list
    updateHistoryList();
}

// Call updateHistoryList once when the page loads to display the initial history
document.addEventListener('DOMContentLoaded', updateHistoryList);



// Add this function to script.js
function shareUrl() {
    if (navigator.share) {
        navigator.share({
            title: 'Shared URL',
            text: 'Check out this shortened URL:',
            url: shortenedUrl // Assuming shortenedUrl is the global variable containing the shortened URL
        })
            .then(() => console.log('URL shared successfully'))
            .catch((error) => console.error('Error sharing URL', error));
    } else {
        // Fallback for browsers that do not support Web Share API
        alert('Sharing not supported in this browser. You can manually copy the URL.');
    }
}



function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    // Optionally, you can provide user feedback (e.g., show a tooltip)
    const copyButton = document.querySelector('.btn-dark');
    copyButton.innerHTML = `<span class="material-symbols-outlined">
    check_circle
    </span>`;
    setTimeout(() => {
        copyButton.innerHTML = `<span class="material-symbols-outlined">
      content_copy
      </span>`;
    }, 2000); // Reset the button text after 2 seconds
}

// QR Code generator
let imgBox = document.getElementById("imgBox");
let qrimage = document.getElementById("qrimg");

function generateQR() {
    qrimage.src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + shortenedUrl;
    imgBox.classList.add("show-img");
}
document.getElementById('flipButton').addEventListener('click', function () {
    // Delay execution by 2000 milliseconds (2 seconds)
    setTimeout(function () {
        document.getElementById('flip-container').classList.toggle('flipped');
    }, 1000);
});

