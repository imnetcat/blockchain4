import { createHash } from 'crypto';
import request from 'request-promise';

const PoWValidityRule = (proof) => {
    if (!proof) return false;
    return proof[proof.length - 2] === '1' && proof[proof.length - 1] === '0';
}

class Blockchain {
    constructor() {
        this.nodes = new Set();
        this.chain = [];
        this.transactions = [];
        // Generate genesis block - the first block of the chain
        this.newBlock('05102001', 'Guskov');
    }

    addNode(host) {
        this.nodes.add(host);
    }

    // Check that the hash entered in the block is correct
    validСhain(chain) {
        let lastBlock = chain[0];
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            // Check the correctness of the block hash
            if (block.parentHash != this.hash(lastBlock)) {
                console.log('block.parentHash != this.hash(lastBlock)', block.parentHash, this.hash(lastBlock), block, lastBlock)
                return false;
            }
            // We check whether the confirmation of work is correct
            if (!this.validateProofOfWork(lastBlock.proof, block.proof)) {
                console.log('!this.validateProofOfWork(lastBlock.proof, block.proof)'.lastBlock.proof, block.proof)
                return false;
            }
            lastBlock = block
        }

        return true;
    }

    // Resolve consensus problem
    // Replaces chain with the longest node in the network
    async resolveConflicts() {
        let newChain = undefined;
        // We are looking only for chains longer than ours
        let maxLengthChain = this.chain.length;

        // check all nodes from all network nodes
        for (const node of this.nodes) {
            const res = await request(`http://${node}/chain`);
            const { chain, length } = JSON.parse(res);
            if (length > maxLengthChain && this.validСhain(chain)) {
                maxLengthChain = length;
                newChain = chain;
            }
        }

        if (newChain) {
            this.chain = newChain;
            return true;
        }

        return false;
    }

    // Add new block to the chain
    newBlock(proof, parentHash) {
        const parentBlock = this.getLastBlock();
        const parentIndex = parentBlock?.index;
        const block = {
            index: parentBlock ? parentIndex + 1 : 0,
            timestamp: new Date().getTime(),
            transactions: this.transactions,
            proof,
            parentHash: parentHash || this.hash(parentBlock),
        };
        // Add blcok to the chain
        this.chain.push(block);
        // clear transiction queue
        this.transactions = [];
        return block;
    }

    // Add new transaction to the queue
    newTransaction(sender, recipient, amount) {
        // Add transaction to the queue
        this.transactions.push({
            sender,
            recipient,
            amount
        });

        // Return next chain block index
        return this.chain.length;
    }

    // Generate hash from provided block
    hash(block) {
        return createHash('sha256').update(JSON.stringify(block)).digest('hex');
    }

    getLastBlock() {
        if (this.chain.length === 0) return undefined;
        return this.chain[this.chain.length - 1];
    }

    proofOfWork() {
        let proof = undefined;
        const previousProof = this.getLastBlock().proof;
        while (!PoWValidityRule(proof)) {
            proof = createHash('sha256').update(`${previousProof}${proof}`).digest('hex')
        }
        return proof;
    }

    validateProofOfWork(previousProof, proof) {
        if (!previousProof || !proof) return false;
        return PoWValidityRule(proof);
    }

    mine(nodeAddress) {
        // Calculate PoW
        const proof = this.proofOfWork();
        // Add miner reward to the mining node
        this.newTransaction('0', nodeAddress, 5);
        // Add new block to the chain
        return this.newBlock(proof);
    }
}

export default Blockchain;
