import express from 'express';
import Blockchain from "./blockchain.js";

class Node {
    constructor(nodeAddress) {
        const blockchain = new Blockchain();
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.port = 5000

        this.app.post('/transactions/new', (req, res) => {
            const {
                sender, recipient, amount
            } = req.body;
            if (!sender || !recipient || !amount) {
                res.status(500);
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
