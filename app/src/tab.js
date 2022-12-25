const fs = require('fs')

class Tab {

    constructor(app, component) {
        this.app = app;
        this.component = component;
        this.style = null;
        this.events = {
            onFocus: (tabDOM, componentDOM) => { },
            onClose: () => { }
        };

        // Instantiate the component
        this.componentInstance = new this.component.object(
            this.app, // App instance
            this, // Tab instance
            this.component.schema, // Component schema
            this.component.strings // Component i18n strings
        );
        this.componentDOM = this.componentInstance.render();

        // Render tab
        this.tabDOM = this.render({
            title: this.component.schema.title
        });

        // Append tab to right
        document
            .querySelector('main > .btn-group > .container-fluid')
            .append(this.tabDOM);

        // Append style to head if exist
        if (fs.existsSync(`${this.component.path}/style.css`)) {
            const content = fs.readFileSync(
                `${this.component.path}/style.css`,
                { encoding: 'utf8', flag: 'r' }
            );

            // Create style node
            this.style = document.createElement('style');
            this.style.textContent = content;
            document.head.appendChild(this.style);
        }

        // Append component container to layout
        document
            .querySelector('components')
            .append(this.componentDOM);

        // Focus new component
        this.focus();
    }

    onFocus(fn) {
        this.events.onFocus = fn;
    }

    onClose(fn) {
        this.events.onClose = fn;
    }

    close() {
        this.events.onClose();
        this.componentDOM.remove();
        this.tabDOM.remove();
        if(this.style != null)
            this.style.remove();

        if(
            (document.querySelectorAll('components > div.d-none').length) &&
            (document.querySelectorAll('components > div').length)
        )
            document.querySelector('components > div:last-child').classList.remove('d-none');

        // ES6 bug fix: Manual destructor
        if(this.componentInstance.__proto__.hasOwnProperty('destructor'))
            this.componentInstance.destructor();

        this.componentInstance = null;
    }

    focus() {
        // Deactive all tabs
        document
            .querySelectorAll('main > .btn-group > .container-fluid > div')
            .forEach(tabDOMItem => tabDOMItem.classList.remove('active'));

        // Active current tab
        this.tabDOM.classList.add('active');

        // Hide all components
        document
            .querySelectorAll('components > div')
            .forEach(componentItem => {
                componentItem.classList.add('d-none');
            });

        // Show current component
        this.componentDOM.classList.remove('d-none');

        // Call user event
        this.events.onFocus(this.tabDOM, this.componentDOM);
    }

    render(opts) {
        const domParser = new DOMParser();

        // Initialize tab
        const dom = domParser.parseFromString(`
            <div class="btn-group d-inline-flex">
                <button type="button" class="btn btn-secondary text-truncate"></button>
                <button type="button" class="btn btn-secondary m-0">&times;</button>
            </div>
            `, 'text/html'
        ).querySelector('div');

        dom
            .querySelector('button.text-truncate')
            .textContent = opts.title;

        // Focus tab event
        dom
            .querySelector('button:nth-child(1)')
            .addEventListener('mousedown', event => this.focus());

        // Close tab event
        dom
            .querySelector('button:nth-child(2)')
            .addEventListener('mousedown', event => this.close());

        return dom;
    }
}

module.exports = Tab;
