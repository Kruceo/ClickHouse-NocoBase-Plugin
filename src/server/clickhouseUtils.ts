class LogicalOperators {
    private history = [""]
    get last() {
        return this.history[this.history.length - 1]
    }
    add(op: "AND" | "OR" | "") {
        this.history.push(op)
    }
    pop() {
        this.history.pop()
    }
}

// verifyObj(obj)
export function generateWhereClause(filter) {
    const p = { clause: "" }
    verifyObj(filter, p, new LogicalOperators())
    return p.clause
}


function verifyObj(obj, p: { clause: string }, lo: LogicalOperators) {
    const keys = Object.keys(obj)

    let hasBracket = false
    // let clause = ""
    for (const key of keys) {
        if (key.startsWith("$")) {
            if (key == "$and") {
                lo.add("AND")
                p.clause += ("(")
                hasBracket = true
            }
            else if (key == "$or") {
                lo.add("OR")
                p.clause += ("(")
                hasBracket = true
            }
            else {
                // is operator
                const op = key
                const value = obj[key]

                p.clause += (`${parseConditions(op, value)} ${lo.last}`)
            }
        }
        else if (!/^\d+$/.test(key)) {
            // probably a field
            p.clause += ` ${key} `
        }
        // read content of the next
        if (typeof obj[key] == "object") {
            verifyObj(obj[key], p, lo)
        }

        if (hasBracket) {
            if (p.clause.endsWith(lo.last)) {
                p.clause = p.clause.slice(0, p.clause.length - lo.last.length)
            }
            p.clause += ")"
            lo.pop()
            p.clause += `${lo.last}`
        }

    }
}






function parseConditions(op, value) {
    switch (op) {
        case "$gt":
            return `> ${value}`;
        case "$lt":
            return `< ${value}`;
        case "$lte":
            return `<= ${value}`;
        case "$gte":
            return `>= ${value}`;
        case "$eq":
            return `= ${value}`;
        case "$ne":
            return `!= ${value}`;

        case "$includes":
            return `LIKE '%${value}%'`;
        case "$empty":
            return `IS NULL`;
        case "$notEmpty":
            return `IS NOT NULL`;
        default:
            throw new Error(`Operador desconhecido: ${op}`);
    }
}
