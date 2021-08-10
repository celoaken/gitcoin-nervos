import Web3 from 'web3';
import { Add } from '../../types/Add';
export declare class AddWrapper {
    web3: Web3;
    contract: Add;
    address: string;
    constructor(web3: Web3);
    get isDeployed(): boolean;
    getCurrentNumber(fromAddress: string): Promise<number>;
    add(n: number, fromAddress: string): Promise<import("web3-core").TransactionReceipt>;
    deploy(fromAddress: string): Promise<void>;
    useDeployed(contractAddress: string): void;
}
