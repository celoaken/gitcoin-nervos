/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import './app.scss';
import 'react-toastify/dist/ReactToastify.css';

import { AddWrapper } from '../lib/contracts/AddWrapper';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { CONFIG } from '../config';

async function createWeb3() {
    // Modern dapp browsers...
    if ((window as any).ethereum) {
	const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;

	const providerConfig = {

	    rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,

	    ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,

	    web3Url: godwokenRpcUrl

	};

	const provider = new PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);

	const web3 = new Web3(provider);
        try {
            // Request account access if needed
            await (window as any).ethereum.enable();
        } catch (error) {
            // User denied account access...
        }

        return web3;
    }

    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}

export function App() {
    const [web3, setWeb3] = useState<Web3>(null);
    const [contract, setContract] = useState<AddWrapper>();
    const [accounts, setAccounts] = useState<string[]>();
    const [balance, setBalance] = useState<bigint>();
    const [existingContractIdInputValue, setExistingContractIdInputValue] = useState<string>();
    const [currentNumber, setCurrentNumber] = useState<number | undefined>();
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const toastId = React.useRef(null);
    const [addNumberInput, setAddNumberInput] = useState<
        number | undefined
    >();

    useEffect(() => {
        if (transactionInProgress && !toastId.current) {
            toastId.current = toast.info(
                'Transaction in progress. Confirm MetaMask signing dialog and please wait...',
                {
                    position: 'top-right',
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    closeButton: false
                }
            );
        } else if (!transactionInProgress && toastId.current) {
            toast.dismiss(toastId.current);
            toastId.current = null;
        }
    }, [transactionInProgress, toastId.current]);

    const account = accounts?.[0];

    async function deployContract() {
        const _contract = new AddWrapper(web3);

        try {
            setTransactionInProgress(true);

            await _contract.deploy(account);

            setExistingContractAddress(_contract.address);
            toast(
                'Successfully deployed a smart-contract. You can now proceed to get or set the value in a smart contract.',
                { type: 'success' }
            );
        } catch (error) {
            console.error(error);
            toast('There was an error sending your transaction. Please check developer console.');
        } finally {
            setTransactionInProgress(false);
        }
    }

    async function getCurrentNumber() {
        const n = await contract.getCurrentNumber(account);
        toast('Successfully read current number: ' + n, { type: 'success' });

        setCurrentNumber(n);
    }

    async function setExistingContractAddress(contractAddress: string) {
        const _contract = new AddWrapper(web3);
        _contract.useDeployed(contractAddress.trim());

        setContract(_contract);
        setCurrentNumber(undefined);
    }

    async function addNumber() {
        try {
            setTransactionInProgress(true);
            await contract.add(addNumberInput, account);
            toast(
                'Successfully added number with the previous one. You can now refresh to get the current number.',
                { type: 'success' }
            );
        } catch (error) {
            console.error(error);
            toast('There was an error sending your transaction. Please check developer console.');
        } finally {
            setTransactionInProgress(false);
        }
    }

    useEffect(() => {
        if (web3) {
            return;
        }

        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);

            const _accounts = [(window as any).ethereum.selectedAddress];
            setAccounts(_accounts);
            console.log({ _accounts });

            if (_accounts && _accounts[0]) {
                const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
                setBalance(_l2Balance);
            }
        })();
    });

    const LoadingIndicator = () => <span className="rotating-icon">??????</span>;

    return (
        <div>
            Your ETH address: <b>{accounts?.[0]}</b>
            <br />
            <br />
            Balance: <b>{balance ? (balance / 10n ** 8n).toString() : <LoadingIndicator />} ETH</b>
            <br />
            <br />
            Deployed contract address: <b>{contract?.address || '-'}</b> <br />
            <br />
            <hr />
            <p>
                The button below will deploy a smart contract which will Add number to the previously
                stored number value. By default when the smart contract is deployed the number starts with 0
            </p>
            <button onClick={deployContract} disabled={!balance}>
                Deploy contract
            </button>
            &nbsp;or&nbsp;
            <input
                placeholder="Existing contract id"
                onChange={e => setExistingContractIdInputValue(e.target.value)}
            />
            <button
                disabled={!existingContractIdInputValue || !balance}
                onClick={() => setExistingContractAddress(existingContractIdInputValue)}
            >
                Use existing contract
            </button>
            <br />
            <br />
            <button onClick={getCurrentNumber} disabled={!contract}>
                Get current number
            </button>
            {currentNumber >= 0 ? <>&nbsp;&nbsp;Current Number: {currentNumber.toString()}</> : null}
            <br />
            <br />
            <input
                type="number"
                onChange={e => setAddNumberInput(parseInt(e.target.value, 10))}
            />
            <button onClick={addNumber} disabled={!contract}>
                Add to the current number
            </button>
            <br />
            <br />
            <br />
            <br />
            <hr />
            <ToastContainer />
        </div>
    );
}
