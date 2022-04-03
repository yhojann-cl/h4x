const path = require('path');
const fs = require('fs');
const glob = require('glob');
const Tab = require('./tab');
const packageJSON = require('../package.json');

class App {

    constructor() {
        // List of all components
        this.components = { };

        // Exrtends strings to html content (prevent XSS)
        Object.assign(String.prototype, {
            toHtml() {
                return this.replace(/[^\w_\-\.\s]/g, (c) => {
                    return `&#${c.charCodeAt(0)};`
                })
            }
        });

        // Define main strings
        this.#setStrings();

        // Components path as self settings
        this.componentsPath = path.join(__dirname, '/components');

        // Preload all components
        this.preloadComponents();

        // Bind all events for DOM
        this.bindEvents();

        // It's ready!
        this.info(`${packageJSON.productName} v${packageJSON.version} - ${this.str.ready}.`);
    }

    #setStrings() {
        this.str = {
            es: {
                ready: 'Listo',
                unableLoadComponent: 'Imposible cargar el componente',
                componentPreloaded: 'Componente precargado sin errores: ',
                componentsPreloaded: 'Total componentes precargados: '
            },
            en: {
                ready: 'Ready',
                unableLoadComponent: 'Unable to load component',
                componentPreloaded: 'Preloaded component without errors: ',
                componentsPreloaded: 'Total preloaded components: '
            }
        };

        const language = Intl.DateTimeFormat().resolvedOptions().locale;
        const languageCode = language.includes('-') ? language.split('-')[0] : language;
        this.str = this.str.hasOwnProperty(languageCode) ? this.str[languageCode] : this.str.en;
    }

    async preloadComponents() {
        glob(`${this.componentsPath}/*.js`, {}, (err, paths) => {
            paths.map(route => route.substring(
                `${this.componentsPath}/`.length, route.length - path.extname(route).length
            )).forEach(route => {
                this.components[route] = require(`${this.componentsPath}/${route}`);
                this.info(`${this.str.componentPreloaded} ${route}.`)
            })
        });
    }

    bindEvents() {
        // Menu component event
        document.querySelectorAll('#sidebar-accordion *[data-component]')
        .forEach(element => element.addEventListener('mousedown', event => {
            const componentRoute = event.srcElement.getAttribute('data-component');
            this.loadComponent(componentRoute)
            .catch(e => {
                this.error(`[error-11] ${this.str.unableLoadComponent}: ${componentRoute}`)
                this.error(e);
            })
        }));

        // Log key event
        document.body.addEventListener('keydown', event => {
            const log = document.querySelector('#log');
            if(event.key === 'F1')
                if(log.getAttribute('selected'))
                    log.removeAttribute('selected')
                else
                    log.setAttribute('selected', true);
        })
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

    async loadComponent(route) {
        // Component exist?
        if(!this.components.hasOwnProperty(route))
            throw new Error(`Component is not found: ${route}`);

        // Instantiate the component
        let component = new this.components[route](this);
        const componentDOM = component.render();

        const tab = new Tab(componentDOM);
        tab.onClose(() => {
            component = null; // Free from memory
        });
        const tabDOM = tab.render({
            title: component.str.component.title
        });

        // Append tab to right
        document
            .querySelector('main > .btn-group > .container-fluid')
            .append(tabDOM);

        // Append componentc ontainer to layout
        document
            .querySelector('components')
            .append(componentDOM);

        // Focus new component
        tab.focus();
    }
}

module.exports = App;
