import express from 'express';
import Blockchain from "./blockchain.js";

class Node {
    constructor(nodeAddress, port) {
        const blockchain = new Blockchain();
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.port = port;

        this.app.post('/nodes/register', (req, res) => {
            if(!req.body.nodes) {
                res.send('Error: Please supply a valid list of nodes');
                return;
            }

            for(const node of req.body.nodes) {
                blockchain.addNode(node);
            }

            res.send({
                message: 'New nodes have been added',
                total_nodes: Array.from(blockchain.nodes)
            });
        });

        this.app.post('/getBalance', (req, res) => {
            const address = req.body.address;
            res.send({ address, balance: blockchain.checkAddressBalance(address) });
        });
        
        this.app.post('/nodes/resolve', async (req, res) => {
            const replaced = await blockchain.resolveConflicts();
            if(replaced) {
                res.send({
                    message: 'Our chain was replaced',
                    new_chain: blockchain.chain
                });
            } else {
                res.send({
                    message: 'Our chain is authoritative',
                    chain: blockchain.chain
                });
            }
        });

        this.app.post('/transactions/new', (req, res) => {
            const {
                sender, recipient, amount
            } = req.body;
            if (!sender || !recipient || !amount) {
                res.end('Missing data!');
                return;
            }
            res.send(`Transaction will be added in block ${blockchain.newTransaction(sender, recipient, amount)
                }`);
        });

        this.app.get('/mine', (req, res) => {
            console.time("mining");
            const newBlock = blockchain.mine(nodeAddress);
            console.timeEnd("mining");
            res.send({
                message: "New Block Forged",
                ...newBlock,
            });
        });

        this.app.get('/chain', (req, res) => {
            res.send({ chain: blockchain.chain, length: blockchain.chain.length });
        });

        this.app.listen(this.port, () => {
            console.log(`Server listening at http://localhost:${this.port}`)
        });
    }
};

export default Node;
