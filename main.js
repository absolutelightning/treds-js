import Tree from "./radix/radix.js"

let radix = new Tree()

radix.insert("cat", 1)
radix.insert("cats", 2)

radix.insert("can", 1)
radix.insert("cap", 2)
radix.insert("cis", 2)

radix.insert("dog", 3)
radix.insert("dogs", 4)

radix.insert("apple", 5)

console.log(radix.getByPrefix("c"))
console.log(radix.getByPrefix("d"))
console.log(radix.getByPrefix("ca"))
console.log(radix.getByPrefix("ci"))

radix.delete("cis")

console.log("after deleting cis")

console.log(radix.getByPrefix("ci"))

console.log(radix.getByFuzzy("cot", 2))
console.log(radix.getByFuzzy("cit", 5, 'DIST'))
