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

function addSite(site) {
    chrome.runtime.sendMessage({ site: site }, function (response) {
        if ( response.error != null) {
            console.error(response.error);
        } else if ( response.sites != null ) {
            siteInput.value = '';
            setTable(response.sites.filter(s => s.isReddit === site.isReddit), site.isReddit ? redditTable : sitesTable);
        }
    });
}

function loadSites(table, filter=(site => true)) {
    chrome.storage.sync.get('blockedSites', function (data) {
        if ( data.blockedSites != null) {
            const sites = data.blockedSites.split(',').map(site => new Site(site)).filter(filter);
            setTable(sites, table);
        }
    });
}

addSiteButton.onclick = function () {
    addSite(new Site(siteInput.value));
};

addRedditButton.onclick = function () {
    addSite(new Site(redditInput.value, true));
};

sitesToggle.onclick = function () {
    tabReddit.hidden = true;
    tabSites.hidden = false;
    sitesToggle.disabled = true;
    redditToggle.disabled = false;
    sitesToggle.classList.remove('nav-button-inactive');
    redditToggle.classList.add('nav-button-inactive');
    activeTab = "Sites";
    loadSites(sitesTable, (site => !site.isReddit));
};

redditToggle.onclick = function () {
    tabReddit.hidden = false;
    tabSites.hidden = true;
    sitesToggle.disabled = false;
    redditToggle.disabled = true;
    sitesToggle.classList.add('nav-button-inactive');
    redditToggle.classList.remove('nav-button-inactive');
    activeTab = "Reddit";
    loadSites(redditTable, (site => site.isReddit));
};

function lock(site) {
    chrome.runtime.sendMessage({ lock: site }, function (response) {
        if ( response.error != null ) {
            console.error(response.error);
        } else if ( response.sites != null ) {
            setTable(response.sites.filter(s => s.isReddit === site.isReddit), site.isReddit ? redditTable : sitesTable);
        }
    })
}

function disable(site) {
    chrome.runtime.sendMessage({ disable: site }, function (response) {
        if ( response.error != null ) {
            console.error(response.error);
        } else if ( response.sites != null ) {
            setTable(response.sites.filter(s => s.isReddit === site.isReddit), site.isReddit ? redditTable : sitesTable);
        }
    })
}

function remove(site) {
    chrome.runtime.sendMessage({ delete: site }, function (response) {
        if ( response.error != null ) {
            console.error(response.error);
        } else if ( response.sites != null) {
            setTable(response.sites.filter(s => s.isReddit === site.isReddit), site.isReddit ? redditTable : sitesTable);
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

loadSites(sitesTable, (site => !site.isReddit));

class Site {
    url;
    isLocked = false;
    isDisabled = false;

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
}
