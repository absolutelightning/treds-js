import Tree from "./radix/radix.js"

let radix = new Tree()

radix.insert("cat", 1)
radix.insert("cats", 2)

radix.insert("dog", 3)
radix.insert("dogs", 4)

console.log(radix.getByPrefix("c"))
console.log(radix.getByPrefix("d"))
