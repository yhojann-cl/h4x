class Tab {

    constructor(componentDOM) {
        this.events = {
            onFocus: (tabDOM, componentDOM) => { },
            onClose: () => { }
        };
        this.componentDOM = componentDOM;
        this.dom = null;
    }

    onFocus(fn) {
        this.events.onFocus = fn;
    }

    onClose(fn) {
        this.events.onClose = fn;
    }

    close() {
        this.componentDOM.remove();
        this.dom.remove();

        if(
            (document.querySelectorAll('components > div.d-none').length) &&
            (document.querySelectorAll('components > div').length)
        )
            document.querySelector('components > div:last-child').classList.remove('d-none');

        this.events.onClose();
    }

    focus() {
        // Deactive all tabs
        document
            .querySelectorAll('main > .btn-group > .container-fluid > div')
            .forEach(tabDOM => tabDOM.classList.remove('active'));

        // Active current tab
        this.dom.classList.add('active');

        // Hide all components
        document
            .querySelectorAll('components > div')
            .forEach(component => {
                component.classList.add('d-none');
            });

        // Show current component
        this.componentDOM.classList.remove('d-none');

        // Call user event
        this.events.onFocus(this.dom, this.componentDOM);
    }

    render(opts) {
        const domParser = new DOMParser();

        // Initialize tab
        this.dom = domParser.parseFromString(`
            <div class="btn-group d-inline-flex">
                <button type="button" class="btn btn-secondary text-truncate"></button>
                <button type="button" class="btn btn-secondary m-0">&times;</button>
            </div>
            `, 'text/html'
        ).querySelector('div');

        this.dom
            .querySelector('button.text-truncate')
            .textContent = opts.title;

        // Focus tab event
        this.dom
            .querySelector('button:nth-child(1)')
            .addEventListener('mousedown', event => this.focus());

        // Close tab event
        this.dom
            .querySelector('button:nth-child(2)')
            .addEventListener('mousedown', event => this.close());

        return this.dom;
    }
}

module.exports = Tab;
