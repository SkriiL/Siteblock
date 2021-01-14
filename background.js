chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if ( request.getSites != null ) {
            chrome.storage.sync.get('blockedSites', function (data) {
                let sites = [];
                if ( data.blockedSites != null ) {
                    sites = data.blockedSites.split(',').map(site => new Site(site));
                }
                sendResponse({ sites: sites });
            });
        } else if ( request.getReddits != null ) {
            chrome.storage.sync.get('blockedReddits', function (data) {
                let reddits = [];
                if ( data.blockedReddits != null ) {
                    reddits = data.blockedReddits.split(',').map(reddit => new Site(reddit));
                }
                sendResponse({ reddits: reddits });
            });
        } else if ( request.site != null ) {
            chrome.storage.sync.get('blockedSites', function (data) {
                let siteStrings = [];
                if ( data.blockedSites != null ) {
                    siteStrings = data.blockedSites.split(',');
                }
                siteStrings.push(request.site.url);
                chrome.storage.sync.set({ 'blockedSites': siteStrings.join(',') });
                const sites = siteStrings.map(site => new Site(site));
                sendResponse({ sites: sites });
            });
        } else if ( request.reddit != null ) {
            chrome.storage.sync.get('blockedReddits', function (data) {
                let redditStrings = [];
                if ( data.blockedReddits != null ) {
                    redditStrings = data.blockedReddits.split(',');
                }
                redditStrings.push(request.reddit.url);
                chrome.storage.sync.set({ 'blockedReddits': redditStrings.join(',') });
                const reddits = redditStrings.map(reddit => new Site(reddit));
                sendResponse({ reddits: reddits });
            });
        } else if ( request.url != null ) {
            chrome.tabs.update( { url: request.url });
            alert('BLOCKED');
            sendResponse({});
        } else if ( request.delete != null ) {
            if ( request.activeTab == null ) {
                sendResponse({ error: 'Active tab not given.'});
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
        } else if (request.lock != null) {
            if ( request.activeTab == null ) {
                sendResponse({ error: 'Active tab not given.'});
            } else if ( request.activeTab === 'Sites') {
                chrome.storage.sync.get('blockedSites', function (data) {
                    const sites = data.blockedSites.split(',')
                        .map(site => new Site(site))
                        .map(site => site.url === request.lock.url ? new Site(site.isLocked ? site.url : `^l${site.url}`) : site);
                    chrome.storage.sync.set({ 'blockedSites': sites.map(site => site.toUrlString()).join(',')});
                    sendResponse({ sites: sites });
                });
            } else if ( request.activeTab === 'Reddit') {
                chrome.storage.sync.get('blockedReddits', function (data) {
                    const reddits = data.blockedReddits.split(',')
                        .map(reddit => new Site(reddit))
                        .map(reddit => reddit.url === request.lock.url ? new Site(reddit.isLocked ? reddit.url : `^l${reddit.url}`) : reddit);
                    chrome.storage.sync.set({ 'blockedReddits': reddits.map(site => site.toUrlString()).join(',')});
                    sendResponse({ reddits: reddits });
                });
            }
        } else if ( request.disable != null) {
            if ( request.activeTab == null ) {
                sendResponse({ error: 'Active tab not given.'});
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

    constructor(url) {
        if ( url.startsWith('^l') ) {
            this.isLocked = true;
            this.url = url.substr(2);
        } else if ( url.startsWith('^d') ) {
            this.isDisabled = true;
            this.url = url.substr(2);
        } else {
            this.url = url;
        }
    }

    toUrlString() {
        return this.isLocked ? `^l${this.url}` : this.isDisabled ? `^d${this.url}` : this.url;
    }
}
