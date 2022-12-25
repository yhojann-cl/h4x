class NewTab {

    constructor(app, tab, schema, strings) {
        this.app = app;
        this.tab = tab;
        this.schema = schema;
        this.strings = strings;

        // Components categories
        this.categories = [
            {
                title: this.strings.categories.textTools,
                components: this.app.components.filter(component => component.schema.categories.includes('text-tools'))
            },
            {
                title: this.strings.categories.discovery,
                components: this.app.components.filter(component => component.schema.categories.includes('discovery'))
            },
            {
                title: this.strings.categories.clients,
                components: this.app.components.filter(component => component.schema.categories.includes('clients'))
            },
            {
                title: this.strings.categories.panic,
                components: this.app.components.filter(component => component.schema.categories.includes('panic'))
            }
        ];
    }

    bindEvents(dom) {
        // Card click event (load tab & component)
        dom.querySelectorAll('*[data-component]')
        .forEach(element => element.addEventListener('click', event => {
            const componentName = event.path.find(element => element.hasAttribute('data-component')).getAttribute('data-component');
            this.app.loadComponent(componentName)
            .then(() => this.tab.close())
            .catch(ignored => { });
        }));

        // Search
        dom
        .querySelector('input[type="text"]')
        .addEventListener('input', (event) => this.search(dom, event.target.value));

        // Drag icons
        dom
        .querySelectorAll('[data-component] button[draggable="true"][data-drag]')
        .forEach(element => element.addEventListener('dragstart', event => {
            event.dataTransfer.setData('text/plain', event.target.getAttribute('data-drag'));
        }));
    }

    search(dom, term) {
        if(term == '') {
            // By default titles and cards are visible
            dom
                .querySelectorAll('.categories h4, .categories hr, .categories .component')
                .forEach(element => {
                    element.style.display = 'block';
                });

        } else {
            // Hide all titles and cards on search
            dom
                .querySelectorAll('.categories h4, .categories hr, .categories .component')
                .forEach(element => {
                    element.style.display = 'none';
                });

            // Search all cards with content
            dom
                .querySelectorAll('.categories .component')
                .forEach(element => {
                    const contains = element.textContent.toLowerCase().trim().replace(/\s+/g, ' ').includes(term.toLowerCase().trim().replace(/\s+/g, ' '));
                    element.style.display = contains ? 'block' : 'none';
                });
        }
    }

    render() {
        const domParser = new DOMParser();
        const dom = domParser.parseFromString(`
            <div class="new-tab-component m-2">

                <div class="row m-0">
                    <div class="col-md-6 col-sm-12">
                        <div class="input-group my-3">
                            <input
                                type="text"
                                class="form-control form-control-sm text-light"
                                autocorrect="off"
                                autocapitalize="off"
                                spellcheck="false"
                                autocomplete="off"
                                placeholder="${this.strings.search.placeholder}" />
                            <span class="input-group-text">
                                <i class="fa fa-search text-light"></i>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="categories user-select-none">
                    ${this.categories.map(category => (`
                        <h5 class="fw-normal mt-3 mb-1 ms-2">${category.title}</h5>
                        <hr class="mt-1 mb-3" />
                        <div class="row m-0">
                            ${category.components.map(component => (`
                                <style>
                                    .new-tab-component .component-${component.object.name} .card-component-title .btn {
                                        border: none;
                                        color: ${component.schema.icon.color.normal.foreground};
                                        background-color: ${component.schema.icon.color.normal.background};
                                    }
                                    .new-tab-component .component-${component.object.name} .card-component-title .btn:hover {
                                        color: ${component.schema.icon.color.hover.foreground};
                                        background-color: ${component.schema.icon.color.hover.background};
                                    }
                                </style>
                                <div class="col-md-4 component">
                                    <div
                                        data-component="${component.object.name}"
                                        class="card-component rounded-1 p-2 position-relative mb-3 component-${component.object.name}">
                                        <i class="m-2 display-3 fa ${component.schema.icon.shape}"></i>
                                        <div class="card-component-title mb-1">
                                            <button
                                                type="button"
                                                class="btn btn-secondary float-start me-3 px-0"
                                                draggable="true"
                                                data-drag="${component.object.name}">
                                                ${component.schema.icon.text}
                                            </button>
                                            <p class="fw-bold mb-0">${component.schema.title}</p>
                                            <small class="text-secondary ${component.schema.version.endsWith('-stable') ? '' : 'text-decoration-line-through'}">
                                                v${component.schema.version}
                                            </small>
                                            <div class="clearfix"></div>
                                        </div>
                                        <p class="card-component-description mb-0 px-2">
                                            <small>${component.strings.component.description}</small>
                                        </p>
                                    </div>
                                </div>
                            `)).join('')}
                        </div>
                    `)).join('')}
                </div>
            </div>
        `, 'text/html').querySelector('div');
        this.bindEvents(dom);
        return dom;
    }
}

module.exports = NewTab;
