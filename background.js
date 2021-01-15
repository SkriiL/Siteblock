chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // Site request from content.js
        if (request.getSites != null) {
            chrome.storage.sync.get('blockedSites', function (data) {
                let sites = [];
                if (data.blockedSites != null) {
                    sites = data.blockedSites.split(',').map(site => new Site(site));
                }
                sendResponse({sites: sites});
            });
            // Add site request from popup.js
        } else if (request.site != null) {
            chrome.storage.sync.get('blockedSites', function (data) {
                let siteStrings = [];
                if (data.blockedSites != null) {
                    siteStrings = data.blockedSites.split(',');
                }
                console.log(request.site);
                siteStrings.push(Site.toUrlString(request.site));
                chrome.storage.sync.set({'blockedSites': siteStrings.join(',')}); // Insert '' to delete every blocked site
                const sites = siteStrings.map(site => new Site(site));
                sendResponse({sites: sites});
            });
            // Redirect tab
        } else if (request.url != null) {
            chrome.tabs.update({url: request.url});
            // alert('BLOCKED');
            sendResponse({});
            // Delete request from popup.js
        } else if (request.delete != null) {
            chrome.storage.sync.get('blockedSites', function (data) {
                if (request.delete.isLocked) {
                    sendResponse({error: 'Site is locked.'})
                } else {
                    const sites = data.blockedSites.split(',')
                        .map(site => new Site(site))
                        .filter(site => (site.url !== request.delete.url) || (site.isReddit !== request.delete.isReddit));
                    chrome.storage.sync.set({'blockedSites': sites.length > 0 ? sites.map(site => Site.toUrlString(site)).join(',') : null});
                    sendResponse({sites: sites});
                }
            });
            // Lock request from popup.js
        } else if (request.lock != null) {
            chrome.storage.sync.get('blockedSites', function (data) {
                const sites = data.blockedSites.split(',')
                    .map(site => new Site(site))
                    .map(site => site.url === request.lock.url ? new Site(site.isLocked ? site.url : `^l${Site.toUrlString(site)}`) : site);
                chrome.storage.sync.set({'blockedSites': sites.map(site => Site.toUrlString(site)).join(',')});
                sendResponse({sites: sites});
            });
            // Disable request from popup.js
        } else if (request.disable != null) {
            chrome.storage.sync.get('blockedSites', function (data) {
                if (request.disable.isLocked) {
                    sendResponse({error: 'Site is locked.'})
                } else {
                    const sites = data.blockedSites.split(',')
                        .map(site => new Site(site))
                        .map(site => site.url === request.disable.url ? new Site(site.isDisabled ? site.url : `^d${Site.toUrlString(site)}`) : site);
                    chrome.storage.sync.set({'blockedSites': sites.map(site => Site.toUrlString(site)).join(',')});
                    sendResponse({sites: sites});
                }
            });
        } else {
            sendResponse({error: 'Unknown command'});
        }
        return true;
    }
);

class Site {
    url;
    isLocked = false;
    isDisabled = false;
    isReddit = false;

    constructor(url, isReddit = false) {
        this.url = url;
        this.isReddit = isReddit;
        if (this.url.startsWith('^l')) {
            this.isLocked = true;
            this.url = this.url.substr(2);
        }
        if (this.url.startsWith('^d')) {
            this.isDisabled = true;
            this.url = this.url.substr(2);
        }
        if (this.url.startsWith('^r')) {
            this.isReddit = true;
            this.url = this.url.substr(2);
        }
    }

    static toUrlString(site) {
        let url = site.url;
        if (site.isReddit) {
            url = '^r' + url;
        }
        if (site.isDisabled) {
            url = '^d' + url;
        }
        if (site.isLocked) {
            url = '^l' + url;
        }
        return url;
    }
}
