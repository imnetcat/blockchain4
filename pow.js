import { createHash } from 'crypto';
function random(min, max) {
    return Math.random() * (max - min) + min;
}


const PoWStep = (value) => {
    const newValue = value || new Date().getTime() % random(9999999999, 100);
    const proof = createHash('sha256').update(newValue.toString()).digest('hex');
    return { value: newValue, proof };
}

const PoWValidityRule = (proof) => {
    if (!proof) return false;
    return proof[proof.length - 2] === '1' && proof[proof.length - 1] === '0';
}

class PoW {
    find() {
        let result = undefined;
        while (!PoWValidityRule(result?.proof)) {
            result = PoWStep(result?.proof);
        }
        return result;
    }
    validate(result) {
        if (!result?.proof || !result?.value) return false;
        const proof = PoWStep(result.value);
        return proof === result.proof && PoWValidityRule(result.proof);
    }
}

export default PoW;
