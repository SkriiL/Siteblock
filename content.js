chrome.runtime.sendMessage({ getSites: true }, function (response) {
    if ( response.error != null ) {
        console.error(response.error);
    } else if ( response.sites != null ) {
        isBlocked(response.sites.filter(site => !site.isReddit));
    }
});

function isBlocked(sites) {
    sites.forEach(site => {
        if ( !site.isDisabled ) {
            const regexString = `^(de\.)?(http:\/\/)?(https:\/\/)?(www\.)?${site.url}.*`;
            const regex = new RegExp(regexString);
            if (regex.test(window.location.host)) {
                chrome.runtime.sendMessage({ url: 'https://google.com' }, function (response) {
                    if ( response.error != null ) {
                        console.error(response.error);
                    }
                });
            }
        }
    });
}
