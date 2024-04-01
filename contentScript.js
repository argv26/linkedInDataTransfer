function extractDataFromPage(callback) {
    try {
        
        let data = [];
        data.push({
            type: 'Job',
            title: 'Job Title',
            company: 'Company Name',
            location: 'Job Location',
            url: 'Job URL'
        });
        
        document.querySelectorAll('.reusable-search__result-container').forEach(savedJob => {
            
            let jobTitle = savedJob.querySelector('.entity-result__title-text').innerText;
            let companyName = savedJob.querySelector('.entity-result__primary-subtitle').innerText;
            let jobLocation = savedJob.querySelector('.entity-result__secondary-subtitle').innerText;
            let jobURL = savedJob.querySelector('.app-aware-link').getAttribute('href');
            data.push({
                type: 'job',
                title: jobTitle,
                company: companyName,
                location: jobLocation,
                url: jobURL
            });
        });

        callback(null, data);
    } catch (error) {
        console.log("could'nt extract data");
        callback(error, null);
    }
}

extractDataFromPage(function(error, data) {
    if (error) {
        console.error("Error extracting data:", error);
    } else {
        chrome.runtime.sendMessage({
            action: 'extractedData',
            data: data
        });
    }
});
