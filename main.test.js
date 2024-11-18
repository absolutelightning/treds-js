import Tree from "./radix/radix.js";

function generateRandomStrings(numStrings, length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const results = [];
    for (let i = 0; i < numStrings; i++) {
        let str = '';
        for (let j = 0; j < length; j++) {
            str += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        results.push(str);
    }
    return results;
}

function getExpectedResult(kvMap, prefix) {
    let res = []
    for (const [key, value] of kvMap) {
        if (key.startsWith(prefix)) {
            res.push({key: key, value: value});
        }
    }
    res.sort((a, b) => {
        if (a.key < b.key) return -1; // `a` comes before `b`
        if (a.key > b.key) return 1;  // `a` comes after `b`
        return 0;                     // `a` and `b` are equal
    });
    return res;
}

function RadixTreeTest() {
    let radix = new Tree();;
    let kvMap = new Map();
    const randomStrings = generateRandomStrings(10000, 5); // Generate 100 random keys, each 5 characters long
    randomStrings.forEach((key, index) => {
        radix.insert(key, index); // Use index as value
        kvMap.set(key, index)
    });
    for (const [key, value] of kvMap) {
        const result = radix.getByPrefix(key[0]);
        let expectedResult = getExpectedResult(kvMap, key[0])
        if (expectedResult.length !== result.length) {
            console.log("Failed at Length Check")
            return
        }
        for (let i = 0; i < result.length; i++) {
            if (result[i].key !== expectedResult[i].key || result[i].value !== expectedResult[i].value) {
                console.log("Fail at Data Check")
                return
            }
        }
        console.log("Pass")
    }
}

RadixTreeTest()