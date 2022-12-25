class HashDetector {

    constructor(app, tab, schema, strings) {
        this.app = app;
        this.tab = tab;
        this.schema = schema;
        this.strings = strings;
    }

    bindEvents(dom) {

    }

    render() {
        const domParser = new DOMParser();
        const dom = domParser.parseFromString(`
            <div class="d-flex flex-column flex-wrap justify-content-center h-100 text-center text-muted user-select-none">
                <h1 class="text-uppercase">
                    <i class="fa fa-exclamation-triangle me-2"></i>
                    Under construction
                </h1>
            </div>
        `, 'text/html').querySelector('div');
        this.bindEvents(dom);
        return dom;
    }
}

module.exports = HashDetector;
