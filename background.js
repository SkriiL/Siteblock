chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // Site request from content.js
        if ( request.getSites != null ) {
            chrome.storage.sync.get('blockedSites', function (data) {
                let sites = [];
                if ( data.blockedSites != null ) {
                    sites = data.blockedSites.split(',').map(site => new Site(site));
                }
                sendResponse({ sites: sites });
            });
            // Reddit request from content-reddit.js
        } else if ( request.getReddits != null ) {
            chrome.storage.sync.get('blockedReddits', function (data) {
                let reddits = [];
                if ( data.blockedReddits != null ) {
                    reddits = data.blockedReddits.split(',').map(reddit => new Site(reddit));
                }
                sendResponse({ reddits: reddits });
            });
            // Add site request from popup.js
        } else if ( request.site != null ) {
            chrome.storage.sync.get('blockedSites', function (data) {
                let siteStrings = [];
                if ( data.blockedSites != null ) {
                    siteStrings = data.blockedSites.split(',');
                }
                siteStrings.push(request.site.url);
                chrome.storage.sync.set({ 'blockedSites': siteStrings.join(',') }); // Insert '' to delete every blocked site
                const sites = siteStrings.map(site => new Site(site));
                sendResponse({ sites: sites });
            });
            // Add reddit request from popup.js
        } else if ( request.reddit != null ) {
            chrome.storage.sync.get('blockedReddits', function (data) {
                let redditStrings = [];
                if ( data.blockedReddits != null ) {
                    redditStrings = data.blockedReddits.split(',');
                }
                redditStrings.push(request.reddit.url);
                chrome.storage.sync.set({ 'blockedReddits': redditStrings.join(',') }); // Insert '' to delete every blocked reddit
                const reddits = redditStrings.map(reddit => new Site(reddit));
                sendResponse({ reddits: reddits });
            });
            // Redirect tab
        } else if ( request.url != null ) {
            chrome.tabs.update( { url: request.url });
            alert('BLOCKED');
            sendResponse({});
            // Delete request from popup.js
        } else if ( request.delete != null ) {
            if ( request.activeTab == null ) {
                sendResponse({ error: 'Active tab not given.'});
                // Site delete request
            } else if ( request.activeTab === 'Sites') {
                chrome.storage.sync.get('blockedSites', function (data) {
                    if ( request.delete.isLocked ) {
                        sendResponse({ error: 'Site is locked.' })
                    } else {
                        const sites = data.blockedSites.split(',')
                            .map(site => new Site(site))
                            .filter(site => site.url !== request.delete.url);
                        chrome.storage.sync.set({ 'blockedSites': sites.length > 0 ? sites.map(site => site.toUrlString()).join(',') : null});
                        sendResponse({ sites: sites });
                    }
                });
                // Reddit delete request
            } else if ( request.activeTab === 'Reddit') {
                chrome.storage.sync.get('blockedReddits', function (data) {
                    if ( request.delete.isLocked ) {
                        sendResponse({ error: 'Reddit is locked.' })
                    } else {
                        const reddits = data.blockedReddits.split(',')
                            .map(reddit => new Site(reddit))
                            .filter(reddit => reddit.url !== request.delete.url);
                        chrome.storage.sync.set({ 'blockedReddits': reddits.length > 0 ? reddits.map(reddit => reddit.toUrlString()).join(',') : null});
                        sendResponse({ reddits: reddits });
                    }
                });
            }
            // Lock request from popup.js
        } else if (request.lock != null) {
            console.log(request.lock);
            if ( request.activeTab == null ) {
                sendResponse({ error: 'Active tab not given.'});
                // Site lock request
            } else if ( request.activeTab === 'Sites') {
                chrome.storage.sync.get('blockedSites', function (data) {
                    const sites = data.blockedSites.split(',')
                        .map(site => new Site(site))
                        .map(site => site.url === request.lock.url ? new Site(site.isLocked ? site.url : `^l${site.url}`) : site);
                    chrome.storage.sync.set({ 'blockedSites': sites.map(site => site.toUrlString()).join(',')});
                    sendResponse({ sites: sites });
                });
                // Reddit lock request
            } else if ( request.activeTab === 'Reddit') {
                chrome.storage.sync.get('blockedReddits', function (data) {
                    const reddits = data.blockedReddits.split(',')
                        .map(reddit => new Site(reddit))
                        .map(reddit => reddit.url === request.lock.url ? new Site(reddit.isLocked ? reddit.url : `^l${reddit.url}`) : reddit);
                    chrome.storage.sync.set({ 'blockedReddits': reddits.map(site => site.toUrlString()).join(',')});
                    sendResponse({ reddits: reddits });
                });
            }
            // Disable request from popup.js
        } else if ( request.disable != null) {
            if ( request.activeTab == null ) {
                sendResponse({ error: 'Active tab not given.'});
                // Site lock request
            } else if ( request.activeTab === 'Sites') {
                chrome.storage.sync.get('blockedSites', function (data) {
                    if ( request.disable.isLocked ) {
                        sendResponse({ error: 'Site is locked.' })
                    } else {
                        const sites = data.blockedSites.split(',')
                            .map(site => new Site(site))
                            .map(site => site.url === request.disable.url ? new Site(site.isDisabled ? site.url : `^d${site.url}`) : site);
                        chrome.storage.sync.set({ 'blockedSites': sites.map(site => site.toUrlString()).join(',')});
                        sendResponse({ sites: sites });
                    }
                });
                // Reddit lock request
            } else if ( request.activeTab === 'Reddit') {
                chrome.storage.sync.get('blockedReddits', function (data) {
                    if ( request.disable.isLocked ) {
                        sendResponse({ error: 'Reddit is locked.' })
                    } else {
                        const reddits = data.blockedReddits.split(',')
                            .map(reddit => new Site(reddit))
                            .map(reddit => reddit.url === request.disable.url ? new Site(reddit.isDisabled ? reddit.url : `^d${reddit.url}`) : reddit);
                        chrome.storage.sync.set({ 'blockedReddits': reddits.map(reddit => reddit.toUrlString()).join(',')});
                        sendResponse({ reddits: reddits });
                    }
                });
            }
        } else {
            sendResponse({ error: 'Unknown command' });
        }
        return true;
    }
);

class Site {
    url;
    isLocked = false;
    isDisabled = false;
    isReddit = false;

    constructor(url, isReddit=false) {
        this.url = url;
        this.isReddit = isReddit;
        if ( this.url.startsWith('^l') ) {
            this.isLocked = true;
            this.url = this.url.substr(2);
        }
        if ( url.startsWith('^d') ) {
            this.isDisabled = true;
            this.url = url.substr(2);
        }
        if ( this.url.startsWith('^r')) {
            this.isReddit = true;
            this.url = this.url.substr(2);
        }
    }

    toUrlString() {
        let url = this.url;
        if ( this.isReddit ) {
            url = '^r' + url;
        }
        if ( this.isDisabled ) {
            url = '^d' + url;
        }
        if ( this.isLocked ) {
            url = '^l' + url;
        }
    }
}
