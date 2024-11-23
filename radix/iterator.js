export default class Iterator {
    constructor(node) {
        this.node = node;
        this.stack = [];
        this.leafNode = null;
        this.key = [];
        this.seekLowerBound = false;
        this.patternMatch = false;
        this.pattern = null;
    }

    // Set a pattern for matching keys
    patternMatch(regex) {
        this.patternMatch = true;
        this.pattern = regex;
    }

    // Seek the iterator to a given prefix and return a placeholder watch channel
    seekPrefix(prefix) {
        this.seekLowerBound = false;
        this.stack = [];
        this.key = prefix;
        let n = this.node;
        let search = prefix;

        while (true) {
            if (search.length === 0) {
                this.node = n;
                return;
            }

            // Look for an edge
            const edge = n.getEdge(search[0]);
            if (!edge) {
                this.node = null;
                return;
            }

            n = edge.node;

            // Consume the search prefix
            if (search.startsWith(n.prefix)) {
                search = search.slice(n.prefix.length);
            } else if (n.prefix.startsWith(search)) {
                this.node = n;
                return;
            } else {
                this.node = null;
                return;
            }
        }
    }

    seekPrefixFuzzy(prefix) {
        this.seekLowerBound = false;
        this.stack = [];
        this.key = prefix;
        let n = this.node;
        let search = prefix;

        while (true) {
            if (search.length === 0) {
                this.node = n;
                return;
            }

            // Look for an edge
            const edge = n.getEdge(search[0]);
            if (!edge) {
                this.node = n;
                return;
            }

            n = edge.node;

            // Consume the search prefix
            if (search.startsWith(n.prefix)) {
                search = search.slice(n.prefix.length);
            } else if (n.prefix.startsWith(search)) {
                this.node = n;
                return;
            } else {
                this.node = n;
                return;
            }
        }
    }

    levenshteinDistance(a, b) {
        const dp = Array(a.length + 1)
            .fill(null)
            .map(() => Array(b.length + 1).fill(0));

        for (let i = 0; i <= a.length; i++) dp[i][0] = i;
        for (let j = 0; j <= b.length; j++) dp[0][j] = j;

        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1, // Deletion
                    dp[i][j - 1] + 1, // Insertion
                    dp[i - 1][j - 1] + cost // Substitution
                );
            }
        }
        return dp[a.length][b.length];
    }

    nextFuzzy(word, maxEditDistance) {

        if (this.node && !this.leafNode) {
            this.leafNode = this.node.minimumLeaf();
        }

        while (this.leafNode) {
            if (word.length - maxEditDistance <= this.leafNode.key.length <= word.length + maxEditDistance) {
                const distance = this.levenshteinDistance(this.leafNode.key, word)
                if (distance <= maxEditDistance) {
                    const res = this.leafNode;
                    this.leafNode = this.leafNode.nextLeaf;
                    if (!this.leafNode) {
                        this.node = null;
                    }
                    return { key: res.key, value: res.value, found: true, distance: distance};
                } else {
                    this.leafNode = this.leafNode.nextLeaf;
                }
            }
        }

        this.leafNode = null;
        this.node = null;
        return { key: null, value: null, found: false };
    }

    previousFuzzy(word, maxEditDistance) {
        if (this.node && !this.leafNode) {
            this.leafNode = this.node.minimumLeaf();
            this.leafNode = this.leafNode.prevLeaf
        }

        while (this.leafNode) {
            if (word.length - maxEditDistance <= this.leafNode.key.length <= word.length + maxEditDistance) {
                const distance = this.levenshteinDistance(this.leafNode.key, word)
                if (distance <= maxEditDistance) {
                    const res = this.leafNode;
                    this.leafNode = this.leafNode.prevLeaf;
                    if (!this.leafNode) {
                        this.node = null;
                    }
                    return { key: res.key, value: res.value, found: true };
                } else {
                    this.leafNode = this.leafNode.prevLeaf;
                }
            }
        }

        this.leafNode = null;
        this.node = null;
        return { key: null, value: null, found: false };
    }

    next() {
        if (this.node && !this.leafNode) {
            this.leafNode = this.node.minimumLeaf();
        }

        while (this.leafNode) {
            const keyStr = String.fromCharCode(...this.leafNode.key);
            if (this.patternMatch) {
                // Match pattern
                if (this.pattern.test(keyStr)) {
                    const res = this.leafNode;
                    this.leafNode = this.leafNode.nextLeaf;
                    if (!this.leafNode) {
                        this.node = null;
                    }
                    return { key: res.key, value: res.value, found: true };
                } else {
                    this.leafNode = this.leafNode.nextLeaf;
                    if (!this.leafNode) {
                        this.node = null;
                    }
                }
            } else {
                // Match prefix
                if (this.leafNode.key.startsWith(this.key)) {
                    const res = this.leafNode;
                    this.leafNode = this.leafNode.nextLeaf;
                    if (!this.leafNode) {
                        this.node = null;
                    }
                    return { key: res.key, value: res.value, found: true };
                } else {
                    this.leafNode = null;
                    this.node = null;
                    break;
                }
            }
        }

        this.leafNode = null;
        this.node = null;
        return { key: null, value: null, found: false };
    }
}