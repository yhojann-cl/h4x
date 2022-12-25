const AlgorithmConversor = require('./algorithm-conversor');
const CodeCleaner = require('./code-cleaner');
const DNSQueries = require('./dns-queries');
const HashDetector = require('./hash-detector');
const HTTPDirectoriesSearch = require('./http-directories-search');
const JsonRestClient = require('./json-rest-client');
const LocalFingerprints = require('./local-fingerprints');
const NetworkDiscovery = require('./network-discovery');
const NewTab = require('./new-tab');
const PlainSocketClient = require('./plain-socket-client');
const SecureDeletion = require('./secure-deletion');
const SocketServicesEnumerator = require('./socket-services-enumerator');
const SubdomainsEnumerator = require('./subdomains-enumerator');
const TCPFlowManager = require('./tcp-flow-manager');
const URLDeofuscator = require('./url-deofuscator');
const XMLSoapClient = require('./xml-soap-client');

module.exports = {
    AlgorithmConversor,
    CodeCleaner,
    DNSQueries,
    HashDetector,
    HTTPDirectoriesSearch,
    JsonRestClient,
    LocalFingerprints,
    NetworkDiscovery,
    NewTab,
    PlainSocketClient,
    SecureDeletion,
    SocketServicesEnumerator,
    SubdomainsEnumerator,
    TCPFlowManager,
    URLDeofuscator,
    XMLSoapClient
};
