const CryptoJS = require('crypto-js');

class AlgorithmConversor {

    constructor(app, tab, schema, strings) {
        this.app = app;
        this.tab = tab;
        this.schema = schema;
        this.strings = strings;

        this.state = {
            inputAlgorithm  : 'ascii',
            outputAlgorithm : 'decimal',
            inputContent    : ''
        }
    }

    bindEvents(dom) {

        dom
            .querySelector('select[data-id="select-input"]')
            .addEventListener('change', event => {
                this.state.inputAlgorithm = event.target.value;
                this.computeOutput(dom);
            });

        dom
            .querySelector('select[data-id="select-output"]')
            .addEventListener('change', event => {
                this.state.outputAlgorithm = event.target.value;
                this.computeOutput(dom);
            });

        dom
            .querySelector('textarea[data-id="input-content"]')
            .addEventListener('input', event => {
                this.state.inputContent = event.target.value;
                this.computeOutput(dom);
            })
    }

    computeOutput(dom) {
        let input  = '';
        let output = '';

        if(this.state.inputAlgorithm === 'ascii'){
            // Direct ascii
            input = this.state.inputContent;

        }else if(this.state.inputAlgorithm === 'base64'){
            input = CryptoJS.enc.Base64
                .parse(this.state.inputContent)
                .toString(CryptoJS.enc.Latin1)

        }else if(this.state.inputAlgorithm === 'hexadecimal'){
            let validHexString = this.state.inputContent
                    .replace(/[^0-9a-f]/gi, '')
                    .match(/[\w]{2}/g);

            if(validHexString){
                input = CryptoJS.enc.Hex
                    .parse(validHexString.join(''))
                    .toString(CryptoJS.enc.Latin1);
            }

        }else if(this.state.inputAlgorithm === 'decimal'){
            let str = this.state.inputContent.replace(/\s+/g, ' ').trim();
            str = str.replace(/[^0-9 +]/g, '');
            let values = str.match(/\d+/g) || [];
            for(let i = 0; i < values.length; i++) {
                input += String.fromCharCode(values[i]);
            }

        }else if(this.state.inputAlgorithm === 'octal'){
            let str = this.state.inputContent.replace(/\s+/g, ' ').trim();
            str = str.replace(/[^0-9 +]/g, '');
            let values = str.match(/\d+/g) || [];
            for(let i = 0; i < values.length; i++) {
                input += String.fromCharCode(parseInt(values[i], 8));
            }

        }else if(this.state.inputAlgorithm === 'htmlentity'){
            // TODO: Under construction.
            this.app.error(`[algorithm-conversor] ${this.strings.inputUnderConstruction}: htmlentity`)
            input = '';

        }else if(this.state.inputAlgorithm === 'urlencode'){
            input = unescape(this.state.inputContent);
        }

        if(this.state.outputAlgorithm === 'ascii'){
            output = input; // Direct ascii

        }else if(this.state.outputAlgorithm === 'base64'){
            output = CryptoJS.enc.Latin1
                    .parse(input)
                    .toString(CryptoJS.enc.Base64);

        }else if(this.state.outputAlgorithm === 'hexadecimal'){
            output = CryptoJS.enc.Latin1
                    .parse(input)
                    .toString(CryptoJS.enc.Hex);

        }else if(this.state.outputAlgorithm === 'hexadecimal-prefix-x'){
            if(input){
                output = '\\x' + (CryptoJS.enc.Hex.stringify(
                    CryptoJS.enc.Latin1.parse(input)
                ) + '').match(/[\w]{2}/g).join('\\x');
            }

        }else if(this.state.outputAlgorithm === 'decimal'){
            if(input){
                let dec = '';
                for(let i=0; i < input.length; i++) {
                    dec += input.charCodeAt(i) + ' ';
                }
                output = dec.trim();
            }

        }else if(this.state.outputAlgorithm === 'octal'){
            if(input){
                let dec = '';
                for(let i=0; i < input.length; i++) {
                    dec += input.charCodeAt(i).toString(8) + ' ';
                }
                output = dec.trim();
            }

        }else if(this.state.outputAlgorithm === 'htmlentity'){
            if(input){
                let dec = '';
                for(let i=0; i < input.length; i++) {
                    dec += '&#' + input.charCodeAt(i) + ';';
                }
                output = dec.trim();
            }

        }else if(this.state.outputAlgorithm === 'urlencode'){
            if(input){
                output = '%' + (CryptoJS.enc.Hex.stringify(
                    CryptoJS.enc.Latin1.parse(input)
                ) + '').match(/[\w]{2}/g).join('%');
            }

        }else if(this.state.outputAlgorithm === 'md5'){
            output = CryptoJS.MD5(
                CryptoJS.enc.Latin1.parse(this.state.inputContent)
            ).toString();

        }else if(this.state.outputAlgorithm === 'sha1'){
            output = CryptoJS.SHA1(
                CryptoJS.enc.Latin1.parse(this.state.inputContent)
            ).toString();

        }else if(this.state.outputAlgorithm === 'sha256'){
            output = CryptoJS.SHA256(
                CryptoJS.enc.Latin1.parse(this.state.inputContent)
            ).toString();

        }else if(this.state.outputAlgorithm === 'sha512'){
            output = CryptoJS.SHA512(
                CryptoJS.enc.Latin1.parse(this.state.inputContent)
            ).toString();
        }

        // Final output
        dom.querySelector('textarea[data-id="output-content"]').value = output;
    }

    render() {
        const domParser = new DOMParser();
        const dom = domParser.parseFromString(`
            <div class="d-flex flex-column h-100">
                <div class="d-flex mx-2 mt-2 mb-1">
                    <div class="w-50 me-1">
                        <select
                            data-id="select-input"
                            class="form-select form-select-sm text-light">
                            <optgroup label="${this.strings.algorithmTwoway}">
                                <option selected value="ascii">${this.strings.algorithmAscii}</option>
                                <option value="base64">${this.strings.algorithmBase64}</option>
                                <option value="hexadecimal">${this.strings.algorithmHex}</option>
                                <option value="decimal">${this.strings.algorithmDec}</option>
                                <option value="octal">${this.strings.algorithmOct}</option>
                                <option value="htmlentity">${this.strings.algorithmHtmlentity}</option>
                                <option value="urlencode">${this.strings.algorithmUrlencode}</option>
                            </optgroup>
                        </select>
                    </div>
                    <div class="w-50 ms-1">
                        <select
                            data-id="select-output"
                           class="form-select form-select-sm text-light">
                            <optgroup label="${this.strings.algorithmTwoway}">
                                <option value="ascii">${this.strings.algorithmAscii}</option>
                                <option value="base64">${this.strings.algorithmBase64}</option>
                                <option value="hexadecimal">${this.strings.algorithmHex}</option>
                                <option value="hexadecimal-prefix-x">${this.strings.algorithmHexPrefixX}</option>
                                <option selected value="decimal">${this.strings.algorithmDec}</option>
                                <option value="octal">${this.strings.algorithmOct}</option>
                                <option value="htmlentity">${this.strings.algorithmHtmlentity}</option>
                                <option value="urlencode">${this.strings.algorithmUrlencode}</option>
                            </optgroup>
                            <optgroup label=${this.strings.algorithmOneway}>
                                <option value="md5">${this.strings.algorithmMd5}</option>
                                <option value="sha1">${this.strings.algorithmSha1}</option>
                                <option value="sha256">${this.strings.algorithmSha256}</option>
                                <option value="sha512">${this.strings.algorithmSha512}</option>
                            </optgroup>
                        </select>
                    </div>
                </div>
                <div class="flex-fill d-flex mt-1">
                    <div class="w-50">
                        <textarea
                            data-id="input-content"
                            class="form-control font-monospace h-100 text-green rounded-0"
                            autocorrect="off"
                            autocapitalize="off"
                            spellcheck="false"
                            placeholder="${this.strings.inputContent}"></textarea>
                    </div>
                    <div class="w-50">
                        <textarea
                            data-id="output-content"
                            class="form-control font-monospace h-100 text-green rounded-0"
                            readonly
                            autocorrect="off"
                            autocapitalize="off"
                            spellcheck="false"
                            placeholder="${this.strings.outputContent}"></textarea>
                    </div>
                </div>
            </div>
        `, 'text/html').querySelector('div');
        this.bindEvents(dom);
        return dom;
    }
}

module.exports = AlgorithmConversor;
