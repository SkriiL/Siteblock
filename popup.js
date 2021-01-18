// HTML Elements
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

const tabSettings = document.getElementById('tabSettings');
const settingsToggle = document.getElementById('settingsToggle');
const settingsLockedTable = document.getElementById('settingsLockedTable');
const settingsLockedDropdown = document.getElementById('settingsLockedDropdown');

let activeTab = 'Sites';

// Create an Icon Button (table)
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

// add a site to the blocked sites
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

// Load all blocked sites
function loadSites(table, filter=(site => true)) {
    chrome.storage.sync.get('blockedSites', function (data) {
        if ( data.blockedSites != null) {
            const sites = data.blockedSites.split(',').map(site => new Site(site)).filter(filter);
            setTable(sites, table);
        }
    });
}

// Add Site Button
addSiteButton.onclick = function () {
    addSite(new Site(siteInput.value));
};

// Add Reddit Button
addRedditButton.onclick = function () {
    addSite(new Site(redditInput.value, true));
};

// Sites Tab Toggle
sitesToggle.onclick = function () {
    tabSites.hidden = false;
    tabReddit.hidden = true;
    tabSettings.hidden = true;
    sitesToggle.disabled = true;
    redditToggle.disabled = false;
    settingsToggle.disabled = false;
    sitesToggle.classList.remove('nav-button-inactive');
    redditToggle.classList.add('nav-button-inactive');
    settingsToggle.classList.add('nav-button-inactive');
    activeTab = "Sites";
    loadSites(sitesTable, (site => !site.isReddit));
};

// Reddit Tab toggle
redditToggle.onclick = function () {
    tabSites.hidden = true;
    tabReddit.hidden = false;
    tabSettings.hidden = true;
    sitesToggle.disabled = false;
    redditToggle.disabled = true;
    settingsToggle.disabled = false;
    sitesToggle.classList.add('nav-button-inactive');
    redditToggle.classList.remove('nav-button-inactive');
    settingsToggle.classList.add('nav-button-inactive');
    activeTab = "Reddit";
    loadSites(redditTable, (site => site.isReddit));
};

// Settings Tab toggle
settingsToggle.onclick = function () {
    tabSites.hidden = true;
    tabReddit.hidden = true;
    tabSettings.hidden = false;
    sitesToggle.disabled = false;
    redditToggle.disabled = false;
    settingsToggle.disabled = true;
    sitesToggle.classList.add('nav-button-inactive');
    redditToggle.classList.add('nav-button-inactive');
    settingsToggle.classList.remove('nav-button-inactive');
    activeTab = "Settings";
    loadSites(settingsLockedTable, (site => site.isLocked));
}

// Locked sites dropdown toggle
let settingsLockedOpen = false;
settingsLockedTable.hidden = true;

settingsLockedDropdown.onclick = function () {
    const icon = settingsLockedDropdown.getElementsByTagName('i')[0];
    if ( settingsLockedOpen ) {
        icon.classList.remove('fa-caret-up');
        icon.classList.add('fa-caret-down');
        settingsLockedTable.hidden = true;
        settingsLockedOpen = false;
    } else {
        icon.classList.remove('fa-caret-down');
        icon.classList.add('fa-caret-up');
        settingsLockedTable.hidden = false;
        settingsLockedOpen = true;
    }
}

// lock a site
function lock(site) {
    chrome.runtime.sendMessage({ lock: site }, function (response) {
        console.log(site);
        if ( response.error != null ) {
            console.error(response.error);
        } else if ( response.sites != null ) {
            if ( activeTab === 'Settings' ) {
                setTable(response.sites.filter(s => s.isLocked), settingsLockedTable);
            } else {
                setTable(response.sites.filter(s => s.isReddit === site.isReddit), site.isReddit ? redditTable : sitesTable);
            }
        }
    })
}

// disable a site
function disable(site) {
    chrome.runtime.sendMessage({ disable: site }, function (response) {
        if ( response.error != null ) {
            console.error(response.error);
        } else if ( response.sites != null ) {
            setTable(response.sites.filter(s => s.isReddit === site.isReddit), site.isReddit ? redditTable : sitesTable);
        }
    })
}

// remove a site
function remove(site) {
    chrome.runtime.sendMessage({ delete: site }, function (response) {
        if ( response.error != null ) {
            console.error(response.error);
        } else if ( response.sites != null) {
            setTable(response.sites.filter(s => s.isReddit === site.isReddit), site.isReddit ? redditTable : sitesTable);
        }
    })
}

// Fill the table
function setTable(items, table) {
    // empty the table
    for ( let j = table.rows.length - 1; j >= 0; j-- ) {
        table.deleteRow(j);
    }

    for ( let i = 0; i < items.length; i++ ) {
        const row = table.insertRow(i);

        const contentCell = row.insertCell(0);
        const lockCell = row.insertCell(1);

        contentCell.innerHTML = items[i].url;

        // Settings Tab
        if ( activeTab === 'Settings' ) {
            const iconCell = row.insertCell(0);
            iconCell.innerHTML = `<i class="${items[i].isReddit ? 'fab fa-reddit-alien text-white' : 'fas fa-external-link-alt text-white'}"></i>`;

            lockCell.innerHTML = createIconButton(
                'lock' + items[i].isReddit ? 'Reddit' : 'Sites' + items[i].url, 'fas fa-lock-open text-white'
            )

            iconCell.style.width = '40px';
            contentCell.style.width = '320px';
            lockCell.style.width = '40px';

            document.getElementById('lock' + items[i].isReddit ? 'Reddit' : 'Sites' + items[i].url).onclick = function () {
                lock(items[i]);
            };
            // not Settings Tab
        } else {
            lockCell.innerHTML = createIconButton(
                'lock' + activeTab + items[i].url, 'fas fa-lock text-white'
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

                disableCell.innerHTML = createIconButton('disable' + activeTab + items[i].url, items[i].isDisabled ? 'fas fa-check text-primary' : 'fas fa-ban text-warning');
                deleteCell.innerHTML = createIconButton('delete' + activeTab + items[i].url, 'fas fa-trash text-danger');

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
}

// Load sites at init of popup
loadSites(sitesTable, (site => !site.isReddit));

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
}

class Settings {
    blockedSites;
    blockedReddits;
}
