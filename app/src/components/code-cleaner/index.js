const Beautify = require('js-beautify');

class CodeCleaner {

    constructor(app, tab, schema, strings) {
        this.app = app;
        this.tab = tab;
        this.schema = schema;
        this.strings = strings;
        this.findEvent = null;
    }

    destructor() {
        window.removeEventListener('keydown', this.findShortcutEvent, false);
    }

    bindEvents(dom) {
        const buttonOrder = dom.querySelector('button[data-action="order"]');
        const inputSearch = dom.querySelector('[data-action="search"] input[type="text"]');
        const buttonSearch = dom.querySelector('[data-action="search"] button');

        // Submit and compute button
        buttonOrder.addEventListener('mousedown', event => this.computeOutputEvent(dom));

        // Find shortcut
        window.addEventListener('keydown', event => this.findShortcutEvent(dom, event));

        // Find content
        inputSearch.addEventListener('input', event => this.findContentEvent(dom, event.target.value));
    }

    findContentEvent(dom, text) {
        if(!text.length)
            return;

        const textarea = dom.querySelector('textarea[data-id="input"]');
        const pos = textarea.value.indexOf(text);
        if(pos === -1)
            return;
        //textarea.focus();
        // console.log([pos, pos + text.length])
        textarea.setSelectionRange(pos, pos + text.length);
    }

    findShortcutEvent(dom, event) {
        if( // Ctrl+F to find
            (event.keyCode === 114 || (event.ctrlKey && event.keyCode === 70)) && // Ctrl+F
            (document.activeElement === dom.querySelector('textarea')) // Textarea focused
        ) {
            const inputSearch = dom.querySelector('[data-action="search"] input[type="text"]');
            inputSearch.focus();
        }
    }

    computeOutputEvent(dom) {
        const textarea = dom.querySelector('textarea[data-id="input"]');
        textarea.value = Beautify.js(textarea.value, {
            indent_size: 4,
            indent_char: ' ',
            max_preserve_newlines: 5,
            preserve_newlines: true,
            keep_array_indentation: false,
            break_chained_methods: false,
            indent_scripts: 'normal',
            brace_style: 'collapse',
            space_before_conditional: true,
            unescape_strings: false,
            jslint_happy: false,
            end_with_newline: false,
            wrap_line_length: 0,
            indent_inner_html: false,
            comma_first: false,
            e4x: false,
            indent_empty_lines: false
        });
        textarea.setSelectionRange(0,0);
        textarea.scrollTo({ top: 0 });
        textarea.focus();
    }

    render() {
        const domParser = new DOMParser();
        const dom = domParser.parseFromString(`
            <div class="d-flex flex-column h-100">
                <div class="flex-fill position-relative">
                    <textarea
                        data-id="input"
                        class="form-control font-monospace text-green w-100 h-100 border-0 rounded-0"
                        placeholder="${this.strings.placeholder}"
                        autocorrect="off"
                        autocapitalize="off"
                        spellcheck="false"></textarea>

                    <div class="position-absolute bottom-0 start-0 w-100 p-1 bg-dark border-top border-secondary">
                        <div class="row mx-0">
                            <div class="col-md-9 px-0">
                                <div class="input-group input-group-sm" data-action="search">
                                    <input
                                        type="text"
                                        value=""
                                        placeholder="${this.strings.search.placeholder}"
                                        class="form-control text-light"
                                        autocorrect="off"
                                        autocapitalize="off"
                                        spellcheck="false"
                                        autocomplete="off" />
                                   <button type="button" class="btn btn-primary">
                                       <i class="fa fa-search me-2" aria-hidden="true"></i>
                                       ${this.strings.search.button}
                                   </button>
                                </div>
                            </div>
                            <div class="col-md-3 pe-0 ps-1">
                                <button
                                    type="button"
                                    class="btn btn-sm btn-primary w-100"
                                    data-action="order">
                                    <i class="fa fa-paper-plane me-2"></i>
                                    ${this.strings.submit}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `, 'text/html').querySelector('div');
        this.bindEvents(dom);
        return dom;
    }
}

module.exports = CodeCleaner;
