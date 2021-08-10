"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
const react_1 = __importStar(require("react"));
const web3_1 = __importDefault(require("web3"));
const react_toastify_1 = require("react-toastify");
require("./app.scss");
require("react-toastify/dist/ReactToastify.css");
const nervos_godwoken_integration_1 = require("nervos-godwoken-integration");
const AddWrapper_1 = require("../lib/contracts/AddWrapper");
const web3_2 = require("@polyjuice-provider/web3");
const config_1 = require("../config");
async function createWeb3() {
    // Modern dapp browsers...
    if (window.ethereum) {
        const godwokenRpcUrl = config_1.CONFIG.WEB3_PROVIDER_URL;
        const providerConfig = {
            rollupTypeHash: config_1.CONFIG.ROLLUP_TYPE_HASH,
            ethAccountLockCodeHash: config_1.CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
            web3Url: godwokenRpcUrl
        };
        const provider = new web3_2.PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
        const web3 = new web3_1.default(provider);
        try {
            // Request account access if needed
            await window.ethereum.enable();
        }
        catch (error) {
            // User denied account access...
        }
        return web3;
    }
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}
function App() {
    const [web3, setWeb3] = react_1.useState(null);
    const [contract, setContract] = react_1.useState();
    const [accounts, setAccounts] = react_1.useState();
    const [balance, setBalance] = react_1.useState();
    const [existingContractIdInputValue, setExistingContractIdInputValue] = react_1.useState();
    const [currentNumber, setCurrentNumber] = react_1.useState();
    const [layer2DepositAddress, setLayer2DepositAddress] = react_1.useState();
    const [transactionInProgress, setTransactionInProgress] = react_1.useState(false);
    const toastId = react_1.default.useRef(null);
    const [addNumberInput, setAddNumberInput] = react_1.useState();
    react_1.useEffect(() => {
        if (transactionInProgress && !toastId.current) {
            toastId.current = react_toastify_1.toast.info('Transaction in progress. Confirm MetaMask signing dialog and please wait...', {
                position: 'top-right',
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                closeButton: false
            });
        }
        else if (!transactionInProgress && toastId.current) {
            react_toastify_1.toast.dismiss(toastId.current);
            toastId.current = null;
        }
    }, [transactionInProgress, toastId.current]);
    const account = accounts?.[0];
    async function deployContract() {
        const _contract = new AddWrapper_1.AddWrapper(web3);
        try {
            setTransactionInProgress(true);
            await _contract.deploy(account);
            setExistingContractAddress(_contract.address);
            react_toastify_1.toast('Successfully deployed a smart-contract. You can now proceed to get or set the value in a smart contract.', { type: 'success' });
        }
        catch (error) {
            console.error(error);
            react_toastify_1.toast('There was an error sending your transaction. Please check developer console.');
        }
        finally {
            setTransactionInProgress(false);
        }
    }
    async function generateLayer2DepositAddress() {
        const addressTranslator = new nervos_godwoken_integration_1.AddressTranslator();
        const depositAddress = await addressTranslator.getLayer2DepositAddress(web3, accounts?.[0]);
        setLayer2DepositAddress(depositAddress.addressString);
    }
    async function getCurrentNumber() {
        const n = await contract.getCurrentNumber(account);
        react_toastify_1.toast('Successfully read current number: ' + n, { type: 'success' });
        setCurrentNumber(n);
    }
    async function setExistingContractAddress(contractAddress) {
        const _contract = new AddWrapper_1.AddWrapper(web3);
        _contract.useDeployed(contractAddress.trim());
        setContract(_contract);
        setCurrentNumber(undefined);
    }
    async function addNumber() {
        try {
            setTransactionInProgress(true);
            await contract.add(addNumberInput, account);
            react_toastify_1.toast('Successfully added number with the previous one. You can now refresh to get the current number.', { type: 'success' });
        }
        catch (error) {
            console.error(error);
            react_toastify_1.toast('There was an error sending your transaction. Please check developer console.');
        }
        finally {
            setTransactionInProgress(false);
        }
    }
    react_1.useEffect(() => {
        if (web3) {
            return;
        }
        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);
            const _accounts = [window.ethereum.selectedAddress];
            setAccounts(_accounts);
            console.log({ _accounts });
            if (_accounts && _accounts[0]) {
                const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
                setBalance(_l2Balance);
            }
        })();
    });
    const LoadingIndicator = () => react_1.default.createElement("span", { className: "rotating-icon" }, "\u2699\uFE0F");
    return (react_1.default.createElement("div", null,
        "Your ETH address: ",
        react_1.default.createElement("b", null, accounts?.[0]),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("button", { onClick: generateLayer2DepositAddress }, "Generate Layer2 Deposit Address"),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        "Generated Layer 2 deposit address:",
        react_1.default.createElement("br", null),
        layer2DepositAddress,
        react_1.default.createElement("br", null),
        "You can use ",
        react_1.default.createElement("a", { href: "https://force-bridge-test.ckbapp.dev/bridge/Ethereum/Nervos?xchain-asset=0x0000000000000000000000000000000000000000&receiver={layer2DepositAddress}", target: "_blank" }, "Force Bridge"),
        " to make deposit to the layer 2, make sure that the receiver address is same as above",
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        "Balance: ",
        react_1.default.createElement("b", null,
            balance ? (balance / 10n ** 8n).toString() : react_1.default.createElement(LoadingIndicator, null),
            " ETH"),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        "Deployed contract address: ",
        react_1.default.createElement("b", null, contract?.address || '-'),
        " ",
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("hr", null),
        react_1.default.createElement("p", null, "The button below will deploy a smart contract which will Add number to the previously stored number value. By default when the smart contract is deployed the number starts with 0"),
        react_1.default.createElement("button", { onClick: deployContract, disabled: !balance }, "Deploy contract"),
        "\u00A0or\u00A0",
        react_1.default.createElement("input", { placeholder: "Existing contract id", onChange: e => setExistingContractIdInputValue(e.target.value) }),
        react_1.default.createElement("button", { disabled: !existingContractIdInputValue || !balance, onClick: () => setExistingContractAddress(existingContractIdInputValue) }, "Use existing contract"),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("button", { onClick: getCurrentNumber, disabled: !contract }, "Get current number"),
        currentNumber >= 0 ? react_1.default.createElement(react_1.default.Fragment, null,
            "\u00A0\u00A0Current Number: ",
            currentNumber.toString()) : null,
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("input", { type: "number", onChange: e => setAddNumberInput(parseInt(e.target.value, 10)) }),
        react_1.default.createElement("button", { onClick: addNumber, disabled: !contract }, "Add to the current number"),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("hr", null),
        react_1.default.createElement(react_toastify_1.ToastContainer, null)));
}
exports.App = App;
//# sourceMappingURL=app.js.map