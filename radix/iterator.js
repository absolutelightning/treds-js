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

    // Return the next node in order
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