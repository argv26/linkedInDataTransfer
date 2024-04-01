function signIn() {
    chrome.identity.getAuthToken({interactive: true}, function(token) {
        chrome.runtime.sendMessage({ type: 'ACCESS_TOKEN', token: token });

    });
}

function executeContentScript() {
    signIn();
    chrome.runtime.sendMessage({ action: 'executeContentScript' });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('extractButton').addEventListener('click', executeContentScript);
});