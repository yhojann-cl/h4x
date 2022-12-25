const dns = require('dns');
const { query } = require('dns-query');
const dnsAxfr = require('dns-axfr');
var URL = require('url-parse');
const { v4: uuidv4 } = require('uuid');

// TODO: boton cancelable, overflow a la tabla

class DNSQueries {

    constructor(app, tab, schema, strings) {
        this.app = app;
        this.tab = tab;
        this.schema = schema;
        this.strings = strings;

        this.state = {
            records: {
                'A'          : { id: 1, enabled: true, isCommon: true,  isSpecial: false },
                'AAAA'       : { id: 28, enabled: true, isCommon: false, isSpecial: false },
                'AFSDB'      : { id: 18, enabled: true, isCommon: false, isSpecial: false },
                'APL'        : { id: 42, enabled: true, isCommon: false, isSpecial: false },
                'ATMA'       : { id: 34, enabled: true, isCommon: false, isSpecial: false },
                'AXFR'       : { id: 252, enabled: true, isCommon: true,  isSpecial: true  },
                'CAA'        : { id: 257, enabled: true, isCommon: false, isSpecial: false },
                'CDNSKEY'    : { id: 60, enabled: true, isCommon: false, isSpecial: false },
                'CDS'        : { id: 59, enabled: true, isCommon: false, isSpecial: false },
                'CERT'       : { id: 37, enabled: true, isCommon: false, isSpecial: false },
                'CNAME'      : { id: 5, enabled: true, isCommon: true,  isSpecial: false },
                'DHCID'      : { id: 49, enabled: true, isCommon: false, isSpecial: false },
                'DLV'        : { id: 32769, enabled: true, isCommon: false, isSpecial: false },
                'DNAME'      : { id: 39, enabled: true, isCommon: false, isSpecial: false },
                'DNSKEY'     : { id: 48, enabled: true, isCommon: false, isSpecial: false },
                'DS'         : { id: 43, enabled: true, isCommon: false, isSpecial: false },
                'EID'        : { id: 31, enabled: true, isCommon: false, isSpecial: false },
                'GPOS'       : { id: 27, enabled: true, isCommon: false, isSpecial: false },
                'HINFO'      : { id: 13, enabled: true, isCommon: false, isSpecial: false },
                'IPSECKEY'   : { id: 45, enabled: true, isCommon: false, isSpecial: false },
                'ISDN'       : { id: 20, enabled: true, isCommon: false, isSpecial: false },
                'KEY'        : { id: 25, enabled: true, isCommon: false, isSpecial: false },
                'KX'         : { id: 36, enabled: true, isCommon: false, isSpecial: false },
                'LOC'        : { id: 29, enabled: true, isCommon: false, isSpecial: false },
                'MAILA'      : { id: 254, enabled: true, isCommon: false, isSpecial: false },
                'MB'         : { id: 7, enabled: true, isCommon: false, isSpecial: false },
                'MD'         : { id: 3, enabled: true, isCommon: false, isSpecial: false },
                'MF'         : { id: 4, enabled: true, isCommon: false, isSpecial: false },
                'MG'         : { id: 8, enabled: true, isCommon: false, isSpecial: false },
                'MINFO'      : { id: 14, enabled: true, isCommon: false, isSpecial: false },
                'MR'         : { id: 9, enabled: true, isCommon: false, isSpecial: false },
                'MX'         : { id: 15, enabled: true, isCommon: true,  isSpecial: false },
                'NAPTR'      : { id: 35, enabled: true, isCommon: false, isSpecial: false },
                'NIMLOC'     : { id: 32, enabled: true, isCommon: false, isSpecial: false },
                'NS'         : { id: 2, enabled: true, isCommon: true,  isSpecial: false },
                'NSAP'       : { id: 22, enabled: true, isCommon: false, isSpecial: false },
                'NSAP-PTR'   : { id: 23, enabled: true, isCommon: false, isSpecial: false },
                'NSEC'       : { id: 47, enabled: true, isCommon: false, isSpecial: false },
                'NSEC3'      : { id: 50, enabled: true, isCommon: false, isSpecial: false },
                'NSEC3PARAM' : { id: 51, enabled: true, isCommon: false, isSpecial: false },
                'NULL'       : { id: 10, enabled: true, isCommon: false, isSpecial: false },
                'NXT'        : { id: 30, enabled: true, isCommon: false, isSpecial: false },
                'PTR'        : { id: 12, enabled: true, isCommon: false, isSpecial: false },
                'PX'         : { id: 26, enabled: true, isCommon: false, isSpecial: false },
                'RP'         : { id: 17, enabled: true, isCommon: false, isSpecial: false },
                'RRSIG'      : { id: 46, enabled: true, isCommon: false, isSpecial: false },
                'RT'         : { id: 21, enabled: true, isCommon: false, isSpecial: false },
                'SIG'        : { id: 24, enabled: true, isCommon: false, isSpecial: false },
                'SOA'        : { id: 6, enabled: true, isCommon: true,  isSpecial: false },
                'SPF'        : { id: 99, enabled: true, isCommon: true,  isSpecial: false },
                'SRV'        : { id: 33, enabled: true, isCommon: false, isSpecial: false },
                'SSHFP'      : { id: 44, enabled: true, isCommon: false, isSpecial: false },
                'TA'         : { id: 32768, enabled: true, isCommon: false, isSpecial: false },
                'TKEY'       : { id: 249, enabled: true, isCommon: false, isSpecial: false },
                'TLSA'       : { id: 52, enabled: true, isCommon: false, isSpecial: false },
                'TSIG'       : { id: 250, enabled: true, isCommon: false, isSpecial: false },
                'TXT'        : { id: 16, enabled: true, isCommon: true,  isSpecial: false },
                'URI'        : { id: 256, enabled: true, isCommon: false, isSpecial: false },
                'WKS'        : { id: 11, enabled: true, isCommon: false, isSpecial: false },
                'X25'        : { id: 19, enabled: true, isCommon: false, isSpecial: false }
            },
            hostname: '',
            customNS: `udp4://${dns.getServers()[0]}:53`,
            methods: [ ],
            results: [ ]
        };
    }

    bindEvents(dom) {
        // Objects
        const methodsDiv = dom.querySelector('[data-id="methods"]');
        const methodSelector = dom.querySelector('select[data-id="select-methods"]');
        const methodsCloseButton = dom.querySelector('button[data-id="methods-close"]');
        const submitButton = dom.querySelector('button[data-id="btn-submit"]');
        const hostnameInput = dom.querySelector('[data-id="hostname"]');
        const customNSInput = dom.querySelector('input[data-id="custom-ns"]');
        const methodsAllButton = dom.querySelector('button[data-id="select-methods-all"]');
        const methodsCommonsButton = dom.querySelector('button[data-id="select-methods-commons"]');
        const methodsNoneButton = dom.querySelector('button[data-id="select-methods-none"]');
        const methodsChecks = dom.querySelectorAll('div[data-id="methods"] input[type="checkbox"]');
        const copyResultsBtn = dom.querySelector('button[data-id="results-copy"]');
        const downloadResultsBtn = dom.querySelector('button[data-id="results-download"]');
        const clearResultsBtn = dom.querySelector('button[data-id="results-clear"]');

        methodsDiv.style.height = 0;

        // Show methods selector
        methodSelector.addEventListener('mousedown', event => {
            event.preventDefault();
            methodsDiv.style.height = '100%';
        });

        // Hide methods selector
        methodsCloseButton.addEventListener('mousedown', event => {
            methodsDiv.style.height = 0;
        });

        // Resolve
        submitButton.addEventListener('mousedown', event => this.resolveAll(dom));
        hostnameInput.addEventListener('keydown', event => {
            if(['Enter', 'NumpadEnter'].includes(event.code))
                this.resolveAll(dom)
        });

        // Update hostname value
        hostnameInput.addEventListener('input', event => {
            this.state.hostname = event.target.value;
        });

        // Update custom NS value
        customNSInput.addEventListener('input', event => {
            this.state.customNS = event.target.value;
        });

        // Select all methods
        methodsAllButton.addEventListener('mousedown', event => {
            methodsChecks.forEach(checkbox => {
                checkbox.checked = true;
            });
            Object.entries(this.state.records).forEach(([recordType, record]) => {
                this.state.records[recordType].enabled = true;
            });
        });

        // Select commons methods
        methodsCommonsButton.addEventListener('mousedown', event => {
            methodsChecks.forEach(checkbox => {
                checkbox.checked = this.state.records[checkbox.value].isCommon;
            });
            Object.entries(this.state.records).forEach(([recordType, record]) => {
                this.state.records[recordType].enabled = record.isCommon;
            });
        });

        // Unselect all methods
        methodsNoneButton.addEventListener('mousedown', event => {
            methodsChecks.forEach(checkbox => {
                checkbox.checked = false;
            });
            Object.entries(this.state.records).forEach(([recordType, record]) => {
                this.state.records[recordType].enabled = false;
            });
        });

        // Change method
        methodsChecks.forEach(checkbox => {
            checkbox.addEventListener('change', event => {
                this.state.records[checkbox.value].enabled = event.target.checked;
            });
        });

        // Copy results
        copyResultsBtn.addEventListener('mousedown', event => this.copyResults());

        // Download results
        downloadResultsBtn.addEventListener('mousedown', event => this.downloadResults());

        // Clear results
        clearResultsBtn.addEventListener('mousedown', event => this.clearResults(dom));
    }

    async resolveAll(dom) {
        // Objects
        const methodsDiv = dom.querySelector('[data-id="methods"]');
        const methodSelector = dom.querySelector('select[data-id="select-methods"]');
        const methodsCloseButton = dom.querySelector('button[data-id="methods-close"]');
        const submitButton = dom.querySelector('button[data-id="btn-submit"]');
        const submitButtonText = submitButton.querySelector('span');
        const submitButtonIcon = submitButton.querySelector('i.fa');
        const hostnameInput = dom.querySelector('[data-id="hostname"]');
        const customNSInput = dom.querySelector('input[data-id="custom-ns"]');
        const nsPorts = { 'udp4:': 53, 'udp6:': 53, 'http:': 80, 'https:': 443 };

        // Clear previous results
        this.clearResults(dom);

        // Data
        const hostname = hostnameInput.value.trim();
        const recordsEntries = Object.entries(this.state.records);
        let customNS = null;
        try{
            customNS = new URL(customNSInput.value || `udp4://${dns.getServers()[0]}:53`);
        } catch(e) {}

        if(!hostname) {
            hostnameInput.reportValidity();
            return;
        }

        if((!customNS) || (!Object.keys(nsPorts).includes(customNS.protocol))) {
            customNSInput.reportValidity();
            return;
        }

        if(!customNS.port)
            customNS.port = nsPorts[customNS.protocol]

        if(!customNS.pathname)
            customNS.pathname = '/'

        // Close methods selectors
        methodsDiv.style.height = 0;

        // Disable controls
        [ methodSelector, methodsCloseButton, hostnameInput, customNSInput
        ].forEach(obj => { obj.disabled = true })

        // Change submit button to cancel action
        submitButtonText.textContent = this.strings.cancel;
        submitButtonIcon.classList.remove('d-none');

        // Not all dns servers support multiple dns queries in a single packet:
        // https://github.com/martinheidegger/dns-query/issues/2
        recordsEntries
            .filter(([recordType, record]) => { return record.enabled })
            .map(([recordType, record]) => { return { type: recordType, name: hostname } })
            .forEach(async (question) => {
                if(question.type === 'AXFR') {
                    await dnsAxfr.resolveAxfr(customNS.hostname, question.name, (err, response) => {
                        if(!err)
                            this.renderRecords(dom,
                                response.answers.map(record => {

                                    // Unknown record type by module
                                    if(record.type.constructor.name === 'Number') {

                                        // Find record type in main list
                                        const recordType = Object.keys(this.state.records).find(recordType => {
                                            return this.state.records[recordType].id === record.type;
                                        });

                                        // Record type is known by component?
                                        if(recordType)
                                            record.type = recordType;
                                    }

                                    // Force type for extends String
                                    record.type = record.type.toString();

                                    // Composed record
                                    return {
                                        type  : record.type,
                                        name  : record.name,
                                        ttl   : record.ttl,
                                        value : (
                                            record.hasOwnProperty(record.type.toLowerCase()) ?
                                            record[record.type.toLowerCase()] :
                                            (record => {
                                                let value = { ...record };
                                                delete value.type;
                                                delete value.name;
                                                delete value.ttl;
                                                if(Object.keys(value).length)
                                                    return JSON.stringify(value, null, 4);
                                                else
                                                    return ''; // TODO: Unsupported respnse record type.
                                            })(record)
                                        )
                                    }
                                })
                            );
                    });

                } else {
                    await query(
                        { questions: [ question ] },
                        {
                            endpoints: [{
                                protocol : customNS.protocol,
                                host     : customNS.hostname,
                                port     : parseInt(customNS.port)
                            }],
                            retry: 3,
                            timeout: 4000
                        }
                    )
                    .then(data => {
                        this.renderRecords(dom,
                            data.answers.map(answer => {
                                return {
                                    type  : answer.type,
                                    name  : answer.name,
                                    ttl   : answer.ttl,
                                    value : ((data) => {
                                        if(data.constructor.name === 'String')
                                            return data;

                                        else if(data.constructor.name === 'Object')
                                            return JSON.stringify(data, null, 4);

                                        else if(data.constructor.name === 'Buffer')
                                            return data.toString();

                                        else // TODO: throw?
                                            return data.toString();
                                    })(answer.data)
                                }
                            })
                        )
                    })
                    .catch(e => {
                        if(e.code !== 'ENODATA')
                            this.app.error(e);
                    })
                }
            });

        // Change submit button to normal state
        submitButtonIcon.classList.add('d-none');
        submitButtonText.textContent = this.strings.resolve;

        // Enable controls
        [ methodSelector, methodsCloseButton, hostnameInput, customNSInput
        ].forEach(obj => { obj.disabled = false })
    }

    renderRecords(dom, records) {
        // DOM objects
        const recordsTbody = dom.querySelector('table[data-id="records"] tbody');

        // Append records to results
        this.state.results = this.state.results.concat(records);

        records.forEach(record => {
            const domParser = new DOMParser();
            const tr = domParser.parseFromString(`
                <table>
                    <tbody>
                        <tr>
                            <td class="text-primary-2"><small>${record.type ? record.type.toHtml() : ''}</small></td>
                            <td class="text-primary-2"><small>${record.name ? record.name.toHtml() : ''}</small></td>
                            <td class="text-primary-1"><small>${record.ttl ? parseInt(record.ttl) : ''}</small></td>
                            <td class="font-monospace"><small>${record.value ? record.value.toHtml() : ''}</small></td>
                        </tr>
                    </tbody>
                </table>
            `, 'text/html').querySelector('tr');
            recordsTbody.append(tr);
        })
    }

    clearResults(dom) {
        // DOM objects
        const recordsTbody = dom.querySelector('table[data-id="records"] tbody');

        // Clear data
        this.state.results = [ ];

        // Clear old results on table
        recordsTbody.innerHTML = '';
    }

    copyResults() {
        const textarea = document.createElement('textarea');
        textarea.value = JSON.stringify(this.state.results, undefined, 2);
        textarea.style.position = 'absolute';
        textarea.style.width = '1px';
        textarea.style.height = '1px';
        textarea.style.top = '-10px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea)
    }

    downloadResults() {
        const data = JSON.stringify(this.state.results, undefined, 2);
        const blob = new Blob([data], {type: 'application/json'});
        const a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = `${this.state.hostname}-records.json`;
        a.style.position = 'absolute';
        a.style.width = '1px';
        a.style.height = '1px';
        a.style.overflow = 'hidden';
        a.style.top = '-10px';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    render() {
        const domParser = new DOMParser();
        const dom = domParser.parseFromString(`
            <div class="d-flex flex-column h-100 position-relative">
                <div class="d-flex m-2">
                    <div class="w-25 me-1">
                        <div class="form-group">
                            <label class="form-label w-100 mb-1">
                                <small>${this.strings.hostname}</small>
                            </label>
                            <input
                                data-id="hostname"
                                maxlength="255"
                                type="text"
                                value="${this.state.hostname}"
                                required
                                class="form-control form-control-sm text-light"
                                autocorrect="off"
                                autocapitalize="off"
                                spellcheck="false"
                                autocomplete="off" />
                        </div>
                    </div>
                    <div class="w-25 mx-1">
                        <div class="form-group">
                            <label class="form-label w-100 mb-1">
                                <small>${this.strings.nameserver}</small>
                            </label>
                            <input
                                data-id="custom-ns"
                                maxlength="255"
                                type="text"
                                class="form-control form-control-sm text-light"
                                autocorrect="off"
                                autocapitalize="off"
                                spellcheck="false"
                                autocomplete="off"
                                required
                                value="${this.state.customNS}" />
                        </div>
                    </div>
                    <div class="w-25 mx-1">
                        <div class="form-group">
                            <label class="form-label w-100 mb-1">
                                <small>${this.strings.resolutionType}</small>
                            </label>
                            <select
                                data-id="select-methods"
                                class="form-select form-select-sm text-light">
                                <option>${this.strings.select}</option>
                            </select>
                        </div>
                    </div>
                    <div class="w-25 ms-1">
                        <div class="form-group">
                            <label class="form-label w-100 mb-1">
                                &nbsp;
                            </label>
                            <button data-id="btn-submit" type="button" class="btn btn-sm btn-primary w-100">
                                <i class="fa fa-refresh fa-spin me-2 d-none"></i>
                                <span>${this.strings.resolve}</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="flex-fill position-relative">
                    <div class="card h-100 rounded-0">
                        <div class="card-body p-0 h-100 mh-100">
                            <table data-id="records" class="table table-hover m-0 mh-100">
                                <thead>
                                    <tr class="table-active">
                                        <th class="border-bottom border-secondary">
                                            <span class="btn btn-sm text-light">${this.strings.results.type}</span>
                                        </th>
                                        <th class="border-bottom border-secondary">
                                            <span class="btn btn-sm text-light">${this.strings.results.name}</span>
                                        </th>
                                        <th class="border-bottom border-secondary">
                                            <span class="btn btn-sm text-light">${this.strings.results.ttl}</span>
                                        </th>
                                        <th class="border-bottom border-secondary">
                                            <span class="btn btn-sm text-light">${this.strings.results.value}</span>
                                            <div class="float-end">
                                                <button
                                                    data-id="results-copy" type="button"
                                                    class="btn btn-sm btn-primary me-1" title="${this.strings.copyResults}">
                                                    <i class="fa fa-files-o"></i>
                                                </button>
                                                <button
                                                    data-id="results-download" type="button"
                                                    class="btn btn-sm btn-primary me-1" title="${this.strings.downloadResults}">
                                                    <i class="fa fa-download"></i>
                                                </button>
                                                <button
                                                    data-id="results-clear" type="button"
                                                    class="btn btn-sm btn-danger" title="${this.strings.clearResults}">
                                                    <i class="fa fa-trash"></i>
                                                </button>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="overflow-scroll"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div data-id="methods" class="position-absolute left-0 t-0 w-100 overflow-hidden bg-dark slide-vertical user-select-none">
                    <h4 class="text-center text-muted text-uppercase my-4">
                        ${this.strings.resolutionType}
                    </h4>
                    <div class="px-4">
                        <div class="row ms-0 me-0 mb-2">
                            ${Object.entries(this.state.records).map(([recordType, record]) => {
                                const id = uuidv4();
                                return `
                                    <div class="col-2 mb-2">
                                        <div class="form-check">
                                            <input
                                                class="form-check-input"
                                                type="checkbox"
                                                ${record.enabled ? 'checked' : ''}
                                                value="${recordType}"
                                                id="${id}" />
                                            <label
                                                class="${(record.isSpecial) ? 'text-warning' : ''}"
                                                for="${id}">
                                                <small>${recordType}</small>
                                            </label>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <div>
                            <button type="button" class="btn btn-sm btn-link text-info" data-id="select-methods-all">
                                ${this.strings.selectAll}
                            </button>
                            <button type="button" class="btn btn-sm btn-link text-info" data-id="select-methods-commons">
                                ${this.strings.selectGenerics}
                            </button>
                            <button type="button" class="btn btn-sm btn-link text-info" data-id="select-methods-none">
                                ${this.strings.unselectAll}
                            </button>
                            <button data-id="methods-close" class="btn btn-sm btn-primary float-end px-5">
                                ${this.strings.accept}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `, 'text/html').querySelector('div');
        this.bindEvents(dom);
        return dom;
    }
}

module.exports = DNSQueries;
