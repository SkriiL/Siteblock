chrome.runtime.sendMessage({ getReddits: true }, function (response) {
    if ( response.error != null ) {
        console.error(response.error);
    } else if ( response.reddits != null ) {
        isBlocked(response.reddits);
    }
});

function isBlocked(reddits) {
    reddits.forEach(reddit => {
        if ( !reddit.isDisabled ) {
            const regexString = `^(http:\/\/)?(https:\/\/)?(www\.)?reddit\.com\/(r|user)\/${reddit.url}.*`;
            const regex = new RegExp(regexString);
            if (regex.test(window.location.href)) {
                chrome.runtime.sendMessage({ url: 'https://reddit.com' }, function (response) {
                    if ( response.error != null ) {
                        console.error(response.error);
                    }
                });
            }
        }
    });
}