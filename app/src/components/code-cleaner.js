const Beautify = require('js-beautify');

class Component {

    constructor(app) {

        this.app = app;

        // Load strings
        this.#setStrings();
    }

    #setStrings() {
        this.str = {
            es: {
                component: {
                    title: 'Limpiador de código',
                    description: 'Ordenamiento de múltiples tipos de códigos fuente'
                },
                input: 'Entrada',
                placeholder: 'Ingresa tu código acá',
                submit: 'Ordenar código'
            },
            en: {
                component: {
                    title: 'Code cleaner',
                    description: 'Ordering of multiple types of source codes'
                },
                input: 'Input',
                placeholder: 'Enter your code here',
                submit: 'Order code'
            }
        };

        const language = Intl.DateTimeFormat().resolvedOptions().locale;
        const languageCode = language.includes('-') ? language.split('-')[0] : language;
        this.str = this.str.hasOwnProperty(languageCode) ? this.str[languageCode] : this.str.en;
    }

    bindEvents(dom) {

        // Submit and compute button
        dom
            .querySelector('button[data-id="btn-submit"]')
            .addEventListener('mousedown', event => this.computeOutput(dom));
    }

    computeOutput(dom) {
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
    }

    render() {
        const domParser = new DOMParser();
        const dom = domParser.parseFromString(`
            <div class="d-flex flex-column h-100 position-relative">
                <textarea
                    data-id="input"
                    class="form-control font-monospace flex-fill"
                    placeholder="${this.str.placeholder}"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"></textarea>
                <button data-id="btn-submit" class="btn btn-info position-absolute top-0 end-0 mt-2 me-2">
                    <i class="fa fa-repeat"></i>
                </button>
            </div>
        `, 'text/html').querySelector('div');
        this.bindEvents(dom);
        return dom;
    }
}

module.exports = Component;
