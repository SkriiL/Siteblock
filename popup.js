const tabSites = document.getElementById('tabSites');
const sitesToggle = document.getElementById('sitesToggle');
const addSiteButton = document.getElementById('addSiteButton');
const siteInput = document.getElementById('newSite');
const sitesTable = document.getElementById('sitesTable');

const tabReddit = document.getElementById('tabReddit');
const redditToggle = document.getElementById('redditToggle');
const addRedditButton = document.getElementById('addRedditButton');
const redditInput = document.getElementById('newReddit');
const redditTable = document.getElementById('redditTable');

let activeTab = 'Sites';

function createIconButton(id, iconClass, text) {
    if ( text == null) {
        return `<button class="btn btn-transparent btn-sm" id="${id}"><i class="${iconClass}"></i></button>`;
    } else {
        return `
        <button class="btn btn-transparent btn-sm" id="${id}">
               <span class="text-light">${text}</span>
               <i class="${iconClass}"></i>
        </button>
        `;
    }

}

addSiteButton.onclick = function () {
    chrome.runtime.sendMessage({ site: new Site(siteInput.value) }, function (response) {
        if ( response.error != null) {
            console.error(response.error);
        } else if ( response.sites != null ) {
            siteInput.value = '';
            setTable(response.sites, sitesTable);
        }
    });
};

addRedditButton.onclick = function () {
    chrome.runtime.sendMessage({ reddit: new Site(redditInput.value, true)}, function (response) {
        if ( response.error != null ) {
            console.error(response.error);
        } else if ( response.reddits != null ) {
            redditInput.value = '';
            setTable(response.reddits, redditTable);
        }
    })
};

sitesToggle.onclick = function () {
    tabReddit.hidden = true;
    tabSites.hidden = false;
    sitesToggle.disabled = true;
    redditToggle.disabled = false;
    sitesToggle.classList.remove('nav-button-inactive');
    redditToggle.classList.add('nav-button-inactive');
    activeTab = "Sites";
    chrome.storage.sync.get('blockedSites', function (data) {
        if ( data.blockedSites != null) {
            const sites = data.blockedSites.split(',').map(site => new Site(site));
            setTable(sites, sitesTable);
        }
    });
};

redditToggle.onclick = function () {
    tabReddit.hidden = false;
    tabSites.hidden = true;
    sitesToggle.disabled = false;
    redditToggle.disabled = true;
    sitesToggle.classList.add('nav-button-inactive');
    redditToggle.classList.remove('nav-button-inactive');
    activeTab = "Reddit";
    chrome.storage.sync.get('blockedReddits', function (data) {
        if ( data.blockedReddits != null) {
            const reddits = data.blockedReddits.split(',').map(reddit => new Site(reddit));
            setTable(reddits, redditTable);
        }
    });
};

function lock(item) {
    chrome.runtime.sendMessage({ lock: item, activeTab: activeTab }, function (response) {
        if ( response.error != null ) {
            console.error(response.error);
        } else if ( response.sites != null ) {
            setTable(response.sites, sitesTable);
        } else if ( response.reddits != null ) {
            setTable(response.reddits, redditTable);
        }
    })
}

function disable(item) {
    chrome.runtime.sendMessage({ disable: item, activeTab: activeTab }, function (response) {
        if ( response.error != null ) {
            console.error(response.error);
        } else if ( response.sites != null ) {
            setTable(response.sites, sitesTable);
        } else if ( response.reddits != null ) {
            setTable(response.reddits, redditTable);
        }
    })
}

function remove(item) {
    chrome.runtime.sendMessage({ delete: item, activeTab: activeTab }, function (response) {
        if ( response.error != null ) {
            console.log(response.error);
        } else if ( response.sites != null) {
            setTable(response.sites, sitesTable);
        } else if ( response.reddits != null ) {
            setTable(response.reddits, redditTable);
        }
    })
}

function setTable(items, table) {
    for ( let j = table.rows.length - 1; j >= 0; j-- ) {
        table.deleteRow(j);
    }

    for ( let i = 0; i < items.length; i++ ) {

        const row = table.insertRow(i);

        const contentCell = row.insertCell(0);
        const lockCell = row.insertCell(1);

        contentCell.innerHTML = items[i].url;
        lockCell.innerHTML = createIconButton(
            'lock' + activeTab + items[i].url, 'fa fa-lock text-white'
        );

        if ( items[i].isLocked ) {
            const fill1 = row.insertCell(2);
            const fill2 = row.insertCell(2);
            contentCell.style.width = '360px';
            lockCell.style.width = '40px';
            fill1.style.width = '0';
            fill2.style.width = '0';
            document.getElementById('lock' + activeTab + items[i].url).disabled = true;
        } else {
            const disableCell = row.insertCell(2);
            const deleteCell = row.insertCell(3);

            disableCell.innerHTML = createIconButton('disable' + activeTab + items[i].url, items[i].isDisabled ? 'fa fa-check text-primary' : 'fa fa-ban text-warning');
            deleteCell.innerHTML = createIconButton('delete' + activeTab + items[i].url, 'fa fa-trash text-danger');

            contentCell.style.width = '280px';
            lockCell.style.width = '40px';
            disableCell.style.width = '40px';
            deleteCell.style.width = '40px';

            document.getElementById('disable' + activeTab + items[i].url).onclick = function () {
                disable(items[i]);
            };
            document.getElementById('delete' + activeTab + items[i].url).onclick = function () {
                remove(items[i]);
            };
            document.getElementById('lock' + activeTab + items[i].url).onclick = function () {
                lock(items[i]);
            };
        }
    }
}

chrome.storage.sync.get('blockedSites', function (data) {
    if ( data.blockedSites != null) {
        const sites = data.blockedSites.split(',').map(site => new Site(site));
        setTable(sites, sitesTable);
    }
});

class Site {
    url;
    isLocked = false;
    isDisabled = false;

    constructor(url) {
        this.isReddit = isReddit;
        if ( url.startsWith('^l') ) {
            this.isLocked = true;
            this.url = url.substr(2);
            if ( this.url.startsWith('r')) {
                this.isReddit = true;
                this.url = this.url.substr(2);
            }
        } else if ( url.startsWith('^d') ) {
            this.isDisabled = true;
            this.url = url.substr(2);
            if ( this.url.startsWith('r')) {
                this.isReddit = true;
                this.url = this.url.substr(2);
            }
        } else {
            this.url = url;
        }
    }

    toUrlString() {
        return this.isLocked ? `^l${this.url}` : this.isDisabled ? `^d${this.url}` : this.url;
    }
}
