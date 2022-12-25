const path = require('path');
const fs = require('fs');
const os = require('os');
const glob = require('glob');
const Tab = require('./tab');
const packageJSON = require('../package.json');

// Exrtends strings to html content (prevent XSS)
Object.assign(String.prototype, {
    toHtml() {
        return this.replace(/[^\w_\-\.\s]/g, (c) => {
            return `&#${c.charCodeAt(0)};`
        })
    }
});

class App {

    constructor() {

        // Default base path for configurations and sessions
        this.userVarsPath = `${os.homedir()}/.config/H4X`;

        // Default settings
        this.settings = {
            shortcuts: [ ]
        };

        // List of all components
        this.components = [ ];

        // Define main strings
        this.#setStrings();

        // Check settings integrity
        this.checkSettingsIntegrity();

        // Load settings
        this.loadSettings();

        // Preload all components
        this.loadComponents();

        // Load sidebar shortcuts
        this.loadShortcuts();

        // Bind all events for DOM
        this.bindEvents();

        // It's ready!
        this.info(`${packageJSON.productName} v${packageJSON.version} - ${this.strings.ready}.`);
    }

    #setStrings() {
        const language = this.getLanguage();

        if(language == 'es') {
            this.strings = {
                ready: 'Listo',
                fatal: 'Fatal',
                unableLoadComponent: 'Imposible cargar el componente',
                unablePreloadComponent: 'Imposible precargar el componente',
                componentLoaded: 'Componente cargado',
                componentPreloaded: 'Componente precargado sin errores',
                componentNotFound: 'El componente no existe',
                componentsPreloaded: 'Total componentes precargados',
                shortcutAdded: 'Acceso rápido agregado',
                unableLoadSettings: 'Imposible cargar las configuraciones',
                unableSaveSettings: 'Imposible guardar las configuraciones',
                settingsLoaded: 'Configuraciones cargadas',
                settingsSaved: 'Configuraciones guardadas'
            };

        } else {
            this.strings = {
                ready: 'Ready',
                fatal: 'Fatal',
                unableLoadComponent: 'Unable to load component',
                unablePreloadComponent: 'Unable to preload component',
                componentLoaded: 'Component loaded',
                componentPreloaded: 'Preloaded component without errors',
                componentNotFound: 'The component is not found',
                componentsPreloaded: 'Total preloaded components',
                shortcutAdded: 'Shortcut added',
                unableLoadSettings: 'Unable save settings',
                unableSaveSettings: 'Unable load settings',
                settingsLoaded: 'Loaded settings',
                settingsSaved: 'Saved settings'
            }
        }
    }

    loadComponents() {
        const language = this.getLanguage();

        this.components = glob
        .sync(`${__dirname}/components/*/index.js`)
        .map(componentPath => {

            // Translate to directory path
            componentPath = path.dirname(componentPath);

            try{
                return {
                    path: componentPath,
                    object: require(`${componentPath}/index.js`),
                    schema: require(`${componentPath}/schema.json`),
                    strings: fs.existsSync(`${componentPath}/strings/${language}.json`) ?
                    require(`${componentPath}/strings/${language}.json`) :
                    require(`${componentPath}/strings/en.json`)
                };

            }catch(e) {
                this.error(`[error-502]: ${this.strings.unablePreloadComponent}: ${componentPath}`);
                this.error(e);
                return null;
            }
        })
        .filter(component => (component !== null));
    }

    bindEvents() {
        const shortcuts = document.querySelector('#shortcuts');

        // Add tab button
        document
        .querySelector('#add-tab')
        .addEventListener('mousedown', event => this.loadComponent('NewTab')
        .catch(e => {
            this.error(`[error-500] (${this.strings.fatal}!) ${this.strings.unableLoadComponent}: NewTab`);
            this.error(e);
            throw e;
        }));

        // Log key event
        document.body.addEventListener('keydown', event => {
            const log = document.querySelector('#log');
            if(event.key === 'F1')
                if(log.getAttribute('selected'))
                    log.removeAttribute('selected')
                else {
                    log.setAttribute('selected', true);
                    log.scrollTop = log.scrollHeight;
                }
        });

        // Drag icons to shortcuts
        shortcuts.addEventListener('dragenter', event => {
            event.preventDefault();
            event.target.classList.add('drag-active');
        });

        shortcuts.addEventListener('dragover', event => {
            event.preventDefault();
            event.target.classList.add('drag-active');
        });

        shortcuts.addEventListener('dragleave', event => {
            event.target.classList.remove('drag-active');
        });

        shortcuts.addEventListener('drop', event => {
            event.target.classList.remove('drag-active');

            const componentName = event.dataTransfer.getData('text/plain');
            if(componentName.length > 0) {
                this.addShortcut(componentName);
            }
        });
    }

    checkSettingsIntegrity(){
        // Check if the directory exists
        if(!fs.existsSync(this.userVarsPath))
            fs.mkdirSync(this.userVarsPath, {
                recursive: true
            });

        // Check if settings file exist
        if(!fs.existsSync(`${this.userVarsPath}/settings.json`))
            this.saveSettings();
    }

    loadSettings() {
        try{
            const userSettings = require(`${this.userVarsPath}/settings.json`);
            this.settings = Object.assign(this.settings, userSettings);
            this.info(`${this.strings.settingsLoaded}.`);

        } catch(e) {
            this.error(`[error-500] ${this.strings.unableLoadSettings}.`);
            this.error(e);
            throw e;
        }
    }

    saveSettings() {
        try{
            fs.writeFileSync(
                `${this.userVarsPath}/settings.json`,
                JSON.stringify(this.settings, null, 4),
                {
                    encoding: 'utf8',
                    mode: 0o664,
                    flag: 'w'
                }
            );
            this.info(`${this.strings.settingsSaved}.`);

        } catch(e) {
            this.error(`[error-500] ${this.strings.unableSaveSettings}.`);
            this.error(e);
            throw e;
        }
    }

    addShortcut(componentName){
        // Add to the local database
        this.settings.shortcuts.push(componentName);
        this.saveSettings();

        // Reload sidebar
        this.loadShortcuts();

        this.info(`${this.strings.shortcutAdded}: ${componentName}`);
    }

    loadShortcuts() {
        const sidebar = document.querySelector('sidebar');
        const shortcutsDiv = document.querySelector('sidebar > div');

        // Clear sidebar content
        shortcutsDiv.innerHTML = '';

        // Put each shortcut as sidebar icon
        this.settings.shortcuts.forEach(componentName => {

            // Find component by shortcut name
            const component = this.components.find(component => component.object.name == componentName);
            if(component === undefined) {
                this.error(`[error-404] ${this.strings.componentNotFound}: ${componentName}`);
                return;
            }

            // Create DOM of shortcut
            const domParser = new DOMParser();
            const shortcutDom = domParser.parseFromString(`
                <div class="text-center mb-2">
                    <style>
                        #shortcuts button[data-component="${component.object.name}"] {
                            border: none;
                            color: ${component.schema.icon.color.normal.foreground};
                            background-color: ${component.schema.icon.color.normal.background};
                        }
                        #shortcuts button[data-component="${component.object.name}"]:hover {
                            color: ${component.schema.icon.color.hover.foreground};
                            background-color: ${component.schema.icon.color.hover.background};
                        }
                    </style>
                    <button type="button" class="btn btn-sm btn-secondary px-0" data-component="${component.object.name}"></button>
                </div>
            `, 'text/html').querySelector('div');
            const button = shortcutDom.querySelector('button');

            // Set button content
            button.textContent = component.schema.icon.text;

            // Click event on shortcut
            button.addEventListener('click', event => this.loadComponent(component.object.name));

            // Add to sidebar list
            shortcutsDiv.append(shortcutDom);
        });

        // Show/hide shortcuts legend
        if(shortcutsDiv.querySelectorAll('button').length < 4) {
            sidebar.classList.add('sidebar-legend');

        } else {
            sidebar.classList.remove('sidebar-legend');
        }
    }

    error(obj) {
        console.error(obj);
        this.#log(['fa-exclamation-triangle', 'text-warning'], obj)
    }

    info(obj) {
        console.info(obj);
        this.#log(['fa-info-circle', 'text-info'], obj)
    }

    #log(icons, obj) {
        const maxLines = 255;
        const log = document.querySelector('#log');
        const domParser = new DOMParser();
        const p = domParser.parseFromString(`
            <p class="m-0">
                <small>
                    <i class="fa"></i>
                    <span></span>
                </small>
            </p>
            `, 'text/html'
        ).querySelector('p');
        p.querySelector('span').textContent = obj + '';
        icons.forEach(icon => p.querySelector('i').classList.add(icon));
        log.querySelector('div').append(p);

        const totalP = log.querySelectorAll('div > p').length;
        if(totalP > maxLines)
            log.querySelectorAll('div > p').forEach((p, index) => {
                if((totalP - index) > maxLines)
                    p.remove();
            });

        log.scrollTop = log.scrollHeight;
    }

    async loadComponent(name) {
        const component = this.components.find(component => component.object.name == name);
        if(component === undefined) {
            this.error(`[error-404] ${this.strings.componentNotFound}: ${name}`);
            throw new Error();
        }

        try{
            // Add new tab with component
            new Tab(this, component);
            this.info(`${this.strings.componentLoaded}: ${name} v${component.schema.version}`);

        } catch(e) {
            this.error(`[error-502]: ${this.strings.unableLoadComponent}: ${name}`);
            this.error(e);
            throw e;
        }
    }

    getLanguage() {
        const language = Intl.DateTimeFormat().resolvedOptions().locale;
        return language.includes('-') ? language.split('-')[0].toLowerCase() : language.toLowerCase();
    }
}

module.exports = App;
