import { createHash } from 'crypto';
function random(min, max) {
    return Math.random() * (max - min) + min;
}


const consensusStep = (value) => {
    const newValue = value || new Date().getTime() % random(9999999999, 100);
    const proof = createHash('sha256').update(newValue.toString()).digest('hex');
    return { value: newValue, proof };
}

const consensusValidityRule = (proof) => {
    if (!proof) return false;
    return proof[proof.length - 2] === '1' && proof[proof.length - 1] === '0';
}

class PoWConsensus {
    find() {
        let consensus = undefined;
        while (!consensusValidityRule(consensus?.proof)) {
            consensus = consensusStep(consensus?.proof);
        }
        return consensus;
    }
    validate(consensus) {
        if (!consensus?.proof || !consensus?.value) return false;
        const proof = consensusStep(consensus.value);
        return proof === consensus.proof && consensusValidityRule(consensus.proof);
    }
}

export default PoWConsensus;
