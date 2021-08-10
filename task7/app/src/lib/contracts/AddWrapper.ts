import Web3 from 'web3';
import * as AddJSON from '../../../build/contracts/Add.json';
import { Add } from '../../types/Add';

const DEFAULT_SEND_OPTIONS = {

    gas: 6000000

};

export class AddWrapper {
    web3: Web3;

    contract: Add;

    address: string;

    constructor(web3: Web3) {
        this.web3 = web3;
        this.contract = new web3.eth.Contract(AddJSON.abi as any) as any;
    }

    get isDeployed() {
        return Boolean(this.address);
    }

    async getCurrentNumber(fromAddress: string) {
    	const num = await this.contract.methods.getCurrentNumber().call({ from: fromAddress });
	return parseInt(num, 10);
    }

    async add(n: number, fromAddress: string) {
	const transaction = await this.contract.methods.add(n).send({
		...DEFAULT_SEND_OPTIONS,
		from: fromAddress
	});
	return transaction;
    }

    async deploy(fromAddress: string) {
        const contract = await (this.contract
            .deploy({
                data: AddJSON.bytecode,
                arguments: []
            })
            .send({
                ...DEFAULT_SEND_OPTIONS,
                from: fromAddress,
                to: '0x0000000000000000000000000000000000000000'
            } as any) as any);

        this.useDeployed(contract.contractAddress);
    }

    useDeployed(contractAddress: string) {
        this.address = contractAddress;
        this.contract.options.address = contractAddress;
    }
}
