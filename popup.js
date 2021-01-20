// Classes
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
}

class Settings {
    darkMode = false;
    sync = false;

    constructor(constructString) {
        if (constructString.startsWith('^s')) {
            this.sync = true;
            constructString = constructString.substr(2);
        }
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
        if ( site.sync ) {
            str = '^s' + str;
        }
        return str;
    }
}

// HTML Elements
const documentBody = document.getElementById('documentBody');

const tabSites = document.getElementById('tabSites');
const sitesToggle = document.getElementById('sitesToggle');
const addSiteButton = document.getElementById('addSiteButton');
const siteInput = document.getElementById('newSite');
const sitesTable = document.getElementById('sitesTable');
const sitesErrorText = document.getElementById('sitesErrorText');

const tabReddit = document.getElementById('tabReddit');
const redditToggle = document.getElementById('redditToggle');
const addRedditButton = document.getElementById('addRedditButton');
const redditInput = document.getElementById('newReddit');
const redditTable = document.getElementById('redditTable');
const redditErrorText = document.getElementById('redditErrorText');

const tabSettings = document.getElementById('tabSettings');
const settingsToggle = document.getElementById('settingsToggle');
const settingsLockedTable = document.getElementById('settingsLockedTable');
const settingsLockedDropdown = document.getElementById('settingsLockedDropdown');
const settingsLockedCount = document.getElementById('settingsLockedCount');
const settingsHiddenTable = document.getElementById('settingsHiddenTable');
const settingsHiddenDropdown = document.getElementById('settingsHiddenDropdown');
const settingsHiddenCount = document.getElementById('settingsHiddenCount');
const settingsTutorialDropdown = document.getElementById('settingsTutorialDropdown');
const settingsTutorial = document.getElementById('settingsTutorial');
const settingsDarkModeSwitch = document.getElementById('settingsDarkModeSwitch');
const settingsSyncSwitch = document.getElementById('settingsSyncSwitch');

let textColor = 'text-dark';
let navInactiveClass = 'nav-button-inactive-dark';
let activeTab = 'Sites';
let settings = new Settings('');

// Set classes depending on dark mode
function setClasses(darkMode) {
    textColor = darkMode ? 'text-white' : 'text-dark';
    navInactiveClass = darkMode ? 'nav-button-inactive-dark' : 'nav-button-inactive-light';
    if (darkMode) {
        documentBody.classList.remove('bg-white', 'text-dark');
        documentBody.classList.add('bg-dark', textColor);
        sitesToggle.classList.remove('text-dark', 'nav-button-inactive-light');
        redditToggle.classList.remove('text-dark', 'nav-button-inactive-light');
        settingsToggle.classList.remove('text-dark', 'nav-button-inactive-light');
    } else {
        documentBody.classList.remove('bg-dark', 'text-white');
        documentBody.classList.add('bg-white', textColor);
        sitesToggle.classList.remove('text-white', 'nav-button-inactive-dark');
        redditToggle.classList.remove('text-white', 'nav-button-inactive-dark');
        settingsToggle.classList.remove('text-white', 'nav-button-inactive-dark');
    }
    sitesTable.classList.remove(darkMode ? 'table-light' : 'table-dark');
    sitesTable.classList.add(darkMode ? 'table-dark' : 'table-light');
    redditTable.classList.remove(darkMode ? 'table-light' : 'table-dark');
    redditTable.classList.add(darkMode ? 'table-dark' : 'table-light');

    settingsLockedTable.classList.remove(darkMode ? 'table-light' : 'table-dark');
    settingsLockedTable.classList.add(darkMode ? 'table-dark' : 'table-light');
    settingsHiddenTable.classList.remove(darkMode ? 'table-light' : 'table-dark');
    settingsHiddenTable.classList.add(darkMode ? 'table-dark' : 'table-light');

    settingsLockedDropdown.classList.remove(darkMode ? 'text-dark' : 'text-white');
    settingsHiddenDropdown.classList.remove(darkMode ? 'text-dark' : 'text-white');
    settingsTutorialDropdown.classList.remove(darkMode ? 'text-dark' : 'text-white');
    settingsLockedDropdown.classList.add(textColor);
    settingsHiddenDropdown.classList.add(textColor);
    settingsTutorialDropdown.classList.add(textColor);

    sitesToggle.classList.add(textColor, navInactiveClass);
    redditToggle.classList.add(textColor, navInactiveClass);
    settingsToggle.classList.add(textColor, navInactiveClass);
}

// set switches, buttons, inputs etc
function setSettings() {
    settingsDarkModeSwitch.checked = settings.darkMode;
    settingsSyncSwitch.checked = settings.sync;
}

// Create an icon button
function createIconButton(id, iconClassList=[], text = null, onclick = ()=>{}, disabled = false, tooltip=null) {
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-transparent', 'btn-sm');
    if ( text != null ) {
        const span = document.createElement('span');
        span.innerHTML = text;
        span.classList.add('text-light');
        button.appendChild(span);
    }
    const icon = document.createElement('i');
    iconClassList.forEach(cls => icon.classList.add(cls));
    button.appendChild(icon);
    if ( disabled ) {
        button.disabled = true;
    } else {
        button.onclick = onclick;
    }
    if (tooltip != null) {
        button.setAttribute('title', tooltip);
    }
    return button;
}

function logError(error) {
    if (error) {
        console.error(error);
    }
}

// Add Input Error
function addInputError(input, errorText, value) {
    errorText.innerHTML = value;
    errorText.hidden = false;
    input.classList.add('input-error');
}

// Remove Input Error
function removeInputError(input, errorText) {
    errorText.hidden = true;
    input.classList.remove('input-error');
}

// add a site to the blocked sites
function addSite(site) {
    if (site.url === '' || site.url == null) {
        if (site.isReddit) {
            addInputError(redditInput, redditErrorText, 'Please enter a Reddit first.');
        } else {
            addInputError(siteInput, sitesErrorText, 'Please enter a site first.');
        }
        return;
    } else if (!site.isReddit && !/.*\..*/.test(site.url)) {
        addInputError(siteInput, sitesErrorText, 'Sites need to contain a Top-Level-Domain (e.g. ".com").');
        return;
    }
    chrome.runtime.sendMessage({site: site}, (response) => {
        logError(response.error);
        if (response.sites != null) {
            if (site.isReddit) {
                redditInput.value = '';
            } else {
                siteInput.value = '';
            }
            setTable(response.sites.filter(s => s.isReddit === site.isReddit && !s.isHidden), site.isReddit ? redditTable : sitesTable);
        }
    });
}

// Load all blocked sites
function loadSites(table, filter = (site => true)) {
    chrome.runtime.sendMessage({getSites: true}, (response) => {
        logError(response.error);
        if (response.sites != null) {
            setTable(response.sites.filter(filter), table);
        }
    });
}

// Save settings
function saveSettings() {
    chrome.runtime.sendMessage({setting: settings}, (response)=>{
        logError(response.error);
    });
}

// Load Settings Object
function loadSettings() {
    chrome.runtime.sendMessage({settings: true}, (response) => {
        logError(response.error);
        if (response.settings != null) {
            settings = response.settings;
            setSettings();
            setClasses(settings.darkMode);
            loadSites(sitesTable, (site => !site.isReddit && !site.isHidden));
            toggleTab(tabSites, sitesToggle, 'Sites');
        }
    })
}

// Add Site Button
addSiteButton.onclick = () => {
    addSite(new Site(siteInput.value));
};

// Add Reddit Button
addRedditButton.onclick = () => {
    addSite(new Site(redditInput.value, true));
};

// hide 'Please enter a site to block first.'
siteInput.oninput = (event) => {
    if (sitesErrorText.hidden === false && event.data != null && event.data.length > 0) {
        removeInputError(siteInput, sitesErrorText);
    }
}

// hide 'Please enter a Reddit to block first.'
redditInput.oninput = (event) => {
    if (redditErrorText.hidden === false && event.data != null && event.data.length > 0) {
        removeInputError(redditInput, redditErrorText);
    }
}

// Tab toggle
function toggleTab(tab, button, tabName) {
    [tabSites, tabReddit, tabSettings].filter(t => t !== tab).forEach(t => t.hidden = true);
    [sitesToggle, redditToggle, settingsToggle].filter(t => t !== button).forEach(t => {
        t.disabled = false;
        t.classList.add(navInactiveClass);
    });
    tab.hidden = false;
    button.disabled = true;
    button.classList.remove(navInactiveClass);
    activeTab = tabName;
}

// Sites Tab Toggle
sitesToggle.onclick = () => {
    toggleTab(tabSites, sitesToggle, 'Sites');
    loadSites(sitesTable, (site => !site.isReddit && !site.isHidden));
};

// Reddit Tab toggle
redditToggle.onclick = () => {
    toggleTab(tabReddit, redditToggle, 'Reddit');
    loadSites(redditTable, (site => site.isReddit && !site.isHidden));
};

// Settings Tab toggle
settingsToggle.onclick = () => {
    toggleTab(tabSettings, settingsToggle, 'Settings');
    loadSites(settingsHiddenTable, (site => site.isHidden));
    loadSites(settingsLockedTable, (site => site.isLocked && !site.isHidden));
}

// Dropdown toggle
function toggleDropdown(dropdown, content, isOpen) {
    const icon = dropdown.getElementsByTagName('i')[0];
    if (isOpen) {
        icon.classList.remove('fa-caret-up');
        icon.classList.add('fa-caret-down');
        content.hidden = true;
        return false;
    } else {
        icon.classList.remove('fa-caret-down');
        icon.classList.add('fa-caret-up');
        content.hidden = false;
        return true;
    }
}

// Locked sites dropdown toggle
let settingsLockedOpen = false;
settingsLockedTable.hidden = true;
settingsLockedDropdown.onclick = () => {
    settingsLockedOpen = toggleDropdown(settingsLockedDropdown, settingsLockedTable, settingsLockedOpen);
}

// hidden sites dropdown toggle
let settingsHiddenOpen = false;
settingsHiddenTable.hidden = true;
settingsHiddenDropdown.onclick = () => {
    settingsHiddenOpen = toggleDropdown(settingsHiddenDropdown, settingsHiddenTable, settingsHiddenOpen);
}

// Tutorial dropdown toggle
let settingsTutorialOpen = false;
settingsTutorial.hidden = true;
settingsTutorialDropdown.onclick = () => {
    settingsTutorialOpen = toggleDropdown(settingsTutorialDropdown, settingsTutorial, settingsTutorialOpen);
}

// Dark mode onclick
settingsDarkModeSwitch.onclick = () => {
    settings.darkMode = settingsDarkModeSwitch.checked;
    saveSettings();
    setClasses(settings.darkMode);
    toggleTab(tabSettings, settingsToggle, 'Settings')
    loadSites(settingsHiddenTable, (site => site.isHidden));
    loadSites(settingsLockedTable, (site => site.isLocked && !site.isHidden));
}

// Sync onclick
settingsSyncSwitch.onclick = () => {
    settings.sync = settingsSyncSwitch.checked;
    saveSettings();
}

// lock a site
function lock(site) {
    chrome.runtime.sendMessage({lock: site}, (response) => {
        logError(response.error);
        if (response.sites != null) {
            if (activeTab === 'Settings') {
                setTable(response.sites.filter(s => s.isLocked && !s.isHidden), settingsLockedTable);
            } else {
                setTable(response.sites.filter(s => s.isReddit === site.isReddit && !s.isHidden), site.isReddit ? redditTable : sitesTable);
            }
        }
    })
}

// disable a site
function disable(site) {
    chrome.runtime.sendMessage({disable: site}, (response) => {
        logError(response.error);
        if (response.sites != null) {
            setTable(response.sites.filter(s => s.isReddit === site.isReddit && !s.isHidden), site.isReddit ? redditTable : sitesTable);
        }
    })
}

// remove a site
function remove(site) {
    chrome.runtime.sendMessage({delete: site}, (response) => {
        logError(response.error);
        if (response.sites != null) {
            setTable(response.sites.filter(s => s.isReddit === site.isReddit && !s.isHidden), site.isReddit ? redditTable : sitesTable);
        }
    })
}

// hide a site
function hide(site) {
    chrome.runtime.sendMessage({hide: site}, (response) => {
        logError(response.error);
        if (response.sites != null) {
            if (activeTab === 'Settings') {
                setTable(response.sites.filter(s => s.isHidden), settingsHiddenTable);
                setTable(response.sites.filter(s => s.isLocked && !s.isHidden), settingsLockedTable);
            } else {
                setTable(response.sites.filter(s => s.isReddit === site.isReddit && !s.isHidden), site.isReddit ? redditTable : sitesTable);
            }
        }
    })
}

// Fill the table
function setTable(items, table) {
    // empty the table
    for (let j = table.rows.length - 1; j >= 0; j--) {
        table.deleteRow(j);
    }

    if (table === settingsLockedTable) {
        if (items.length === 0) {
            toggleDropdown(settingsLockedDropdown, settingsLockedTable, true)
        }
        settingsLockedDropdown.disabled = items.length === 0;
        settingsLockedCount.innerHTML = items.length.toString();
    } else if (table === settingsHiddenTable) {
        if (items.length === 0) {
            toggleDropdown(settingsHiddenDropdown, settingsHiddenTable, true)
        }
        settingsHiddenDropdown.disabled = items.length === 0;
        settingsHiddenCount.innerHTML = items.length.toString();
    }

    for (let i = 0; i < items.length; i++) {
        const row = table.insertRow(i);

        const contentCell = row.insertCell(0);
        contentCell.style.lineHeight = '1.6';
        contentCell.innerHTML = items[i].url;

        const lockCell = row.insertCell(1);

        // Settings Tab
        if (activeTab === 'Settings') {
            const iconCell = row.insertCell(0);
            iconCell.innerHTML = `<i class="${items[i].isReddit ? 'fab fa-reddit-alien' : 'fas fa-external-link-alt'} ${textColor}"></i>`;
            iconCell.style.lineHeight = '1.6';

            const lockButton = createIconButton(
                'lock' + (items[i].isReddit ? 'Reddit' : 'Sites') + items[i].url,
                ['fas', items[i].isLocked ? items[i].isHidden ? 'fa-lock' : 'fa-lock-open' : 'fa-lock-open', textColor],
                null,
                ()=>lock(items[i]),
                items[i].isHidden,
                'Lock'
            );

            lockCell.appendChild(lockButton);

            if (items[i].isHidden) {
                const hideCell = row.insertCell(2);
                const hideButton = createIconButton(
                    'hide' + (items[i].isReddit ? 'Reddit' : 'Sites') + items[i].url,
                    ['fas', 'fa-eye', textColor],
                    null,
                    ()=>hide(items[i]),
                    false,
                    'Hide'
                );
                hideCell.append(hideButton);
                hideCell.style.width = '40px';
            }

            iconCell.style.width = '40px';
            contentCell.style.width = items[i].isHidden ? '280px' : '320px';
            lockCell.style.width = '40px';
            // not Settings Tab
        } else {
            const lockButton = createIconButton(
                'lock' + (items[i].isReddit ? 'Reddit' : 'Sites') + items[i].url,
                ['fas', 'fa-lock', textColor],
                null,
                ()=>lock(items[i]),
                items[i].isLocked,
                'Lock'
            );
            lockCell.appendChild(lockButton);

            const hideCell = row.insertCell(1);
            const hideButton = createIconButton(
                'hide' + (items[i].isReddit ? 'Reddit' : 'Sites') + items[i].url,
                ['fas', 'fa-eye-slash', textColor],
                null,
                ()=>hide(items[i]),
                false,
                'Hide'
            );
            hideCell.appendChild(hideButton);

            if (items[i].isLocked) {
                const fill1 = row.insertCell(2);
                const fill2 = row.insertCell(2);
                contentCell.style.width = '320px';
                hideCell.style.width = '40px';
                lockCell.style.width = '40px';
                fill1.style.width = '0';
                fill2.style.width = '0';
            } else {
                const disableCell = row.insertCell(2);
                const disableButton = createIconButton(
                    'disable' + (items[i].isReddit ? 'Reddit' : 'Sites') + items[i].url,
                    items[i].isDisabled ? ['fas', 'fa-check', 'text-primary'] : ['fas', 'fa-ban', 'text-warning'],
                    null,
                    ()=>disable(items[i]),
                    false,
                    'Disable'
                )
                disableCell.appendChild(disableButton);

                const deleteCell = row.insertCell(3);
                const deleteButton = createIconButton(
                    'delete' + (items[i].isReddit ? 'Reddit' : 'Sites') + items[i].url,
                    ['fas', 'fa-trash', 'text-danger'],
                    null,
                    ()=>remove(items[i]),
                    false,
                    'Delete'
                )
                deleteCell.appendChild(deleteButton);

                contentCell.style.width = '240px';
                hideCell.style.width = '40px';
                lockCell.style.width = '40px';
                disableCell.style.width = '40px';
                deleteCell.style.width = '40px';
            }
        }
    }
}

// Load sites at init of popup
loadSettings();
