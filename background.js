let settings = new Settings('^s');

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        // Site request from content.js
        if (request.getSites != null) {
            chrome.storage.sync.get('blockedSites', (data) => {
                let sites = [];
                if (data.blockedSites != null) {
                    sites = data.blockedSites.split(',').map(site => new Site(site));
                }
                sendResponse({sites: sites});
            });
            // Add site request from popup.js
        } else if (request.site != null) {
            chrome.storage.sync.get('blockedSites', (data) => {
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
            chrome.storage.sync.get('blockedSites', (data) => {
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
            chrome.storage.sync.get('blockedSites', (data) => {
                const sites = data.blockedSites.split(',')
                    .map(site => new Site(site))
                    .map(site => {
                        if (site.url === request.lock.url) {
                            site.isLocked = !site.isLocked;
                        }
                        return site;
                    });
                chrome.storage.sync.set({'blockedSites': sites.map(site => Site.toUrlString(site)).join(',')});
                sendResponse({sites: sites});
            });
            // Disable request from popup.js
        } else if (request.disable != null) {
            chrome.storage.sync.get('blockedSites', (data) => {
                if (request.disable.isLocked) {
                    sendResponse({error: 'Site is locked.'})
                } else {
                    const sites = data.blockedSites.split(',')
                        .map(site => new Site(site))
                        .map(site => {
                            if (site.url === request.disable.url) {
                                site.isDisabled = !site.isDisabled;
                            }
                            return site;
                        });
                    chrome.storage.sync.set({'blockedSites': sites.map(site => Site.toUrlString(site)).join(',')});
                    sendResponse({sites: sites});
                }
            });
            // Hide request from popup.js
        } else if (request.hide != null) {
            chrome.storage.sync.get('blockedSites', (data) => {
                const sites = data.blockedSites.split(',')
                    .map(site => new Site(site))
                    .map(site => {
                        if (site.url === request.hide.url) {
                            site.isHidden = !site.isHidden;
                        }
                        return site;
                    });
                chrome.storage.sync.set({'blockedSites': sites.map(site => Site.toUrlString(site)).join(',')});
                sendResponse({sites: sites});
            });
            // Load settings
        } else if (request.getSettings != null) {
            chrome.storage.sync.get('siteblockSettings', (data) => {
                if (data.siteblockSettings != null) {
                    settings = new Settings(data.siteblockSettings);
                    sendResponse({settings: settings});
                }
            });
            // save Settings
        } else if (request.setting != null) {
            chrome.storage.sync.set({'siteblockSettings': Settings.toConstructString(request.setting)});
            sendResponse(request.setting);
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
    isHidden = false;

    constructor(url, isReddit = false) {
        this.url = url;
        this.isReddit = isReddit;
        if (this.url.startsWith('^h')) {
            this.isHidden = true;
            this.url = this.url.substr(2);
        }
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
        if (site.isHidden) {
            url = '^h' + url;
        }
        return url;
    }
}

class Settings {
    darkMode = false;

    constructor(constructString) {
        if (constructString.startsWith('^d')) {
            this.darkMode = true;
            constructString = constructString.substr(2);
        }
    }

    static toConstructString(site) {
        let str = '';
        if ( site.darkMode ) {
            str = '^d' + str;
        }
        return str;
    }

}
