let accessToken;
let spreadsheetId;

chrome.storage.local.get(['spreadsheetId'], function(result) {
    spreadsheetId = result.spreadsheetId || null;
});

function saveSpreadsheetId(spreadsheetId) {
    chrome.storage.local.set({ 'spreadsheetId': spreadsheetId });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ACCESS_TOKEN') {
        accessToken = message.token;
        console.log('Access token received:', accessToken);
    }
});

async function writeToGoogleSheets(data) {

    if (spreadsheetId != null) {
        writeDataToSpreadsheet(spreadsheetId, data, accessToken);
    } else {
        await createSpreadsheet(data, accessToken);
    }
}


async function createSpreadsheet(data, accessToken) {
    const spreadsheetBody = {
        properties: {
            title: 'LinkedInSavedJobs'
        }
    };

    try {
        const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(spreadsheetBody)
        });

        if (response.ok) {
            const responseData = await response.json();
            spreadsheetId = responseData.spreadsheetId;
            saveSpreadsheetId(spreadsheetId);
            console.log(spreadsheetId);
            writeDataToSpreadsheet(spreadsheetId, data, accessToken);
        } else {
            console.error('Error creating spreadsheet:', response.statusText);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

async function writeDataToSpreadsheet(spreadsheetId, data, accessToken) {
    const range = "Sheet1!A1:D" + data.length;
    const values = data.map(job => [job.title, job.company, job.location, job.url]);
    const valueRange = {
      range: range,
      values: values
    };
  
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
  
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(valueRange)
      });
  
      if (response.ok) {
        console.log("Data written successfully!");
      } else {
        const responseData = await response.json();
        console.error("Error writing data to spreadsheet:", responseData.error.message);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  }
  
  

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'extractedData') {
        writeToGoogleSheets(message.data);
    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'executeContentScript') {

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (!tabs || tabs.length === 0 || !tabs[0].id) {
                console.error('Error: No active tab found');
                return;
            }

            let tabId = tabs[0].id;
            console.log('Active tab ID:', tabId);

            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['contentScript.js']
            }).then(() => {
                console.log('Content script executed successfully');
            }).catch(error => {
                console.error('Error executing content script:', error);
            });
        });
    }
});
