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
export function generateWhereClause(filter: Record<string, any>) {
    if (!filter) return null
    const p = { clause: "" }
    verifyObj(filter, p, new LogicalOperators())
    if (p.clause.trim() == "") {
        return null
    }
    return p.clause
}


function verifyObj(obj: Record<string, any>, p: { clause: string }, lo: LogicalOperators) {
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

function normalizeValue(value: string | number) {
    return `${typeof value == "string" ? `'${value}'` : value}`
}

function convertQuarterDate(input: string) {
    const match = input.match(/^(\d{4})Q([1-4])-(\d{2}):(\d{2})$/);
    if (!match) {
        throw new Error('Bad format');
    }

    const year = match[1];
    const quarter = parseInt(match[2]);
    const hour = match[3];
    const minute = match[4];

    // Primeiro mês de cada trimestre
    const quarterStartMonths: Record<number, string> = {
        1: '01', // Q1 -> Janeiro
        2: '04', // Q2 -> Abril
        3: '07', // Q3 -> Julho
        4: '10', // Q4 -> Outubro
    };

    const month: string = quarterStartMonths[quarter];

    return `${year}-${month}-01 ${hour}:${minute}:00`;
}

function normalizeDateValue(value: string, moment?: "last" | "first" | "none") {

    if (/\d+Q\d-/.test(value)) {
        return convertQuarterDate(value)
    }
    else {
        const splitPattern = /(?<=\d\d) (?=\d\d:)/
        let fd = value.toString().split(splitPattern, 2)
        if (fd.length == 1) {
            // case the input dont have a timestamp (eg. 2020-12-10-03:00)
            // this case just have date + timestamp
            // this part of code add a 'zero' timestamp
            value = value.replace(/(-|\+)\d\d:\d\d/, (gg) => ` 00:00:00${gg}`)
            fd = value.split(splitPattern, 2)
        }
        const [time, timezone] = fd[1].split(/(?=\+|-)/)
        const t = time.split(":")

        // just hour and minute
        if (t.length == 2) {
            t.push("00")
        }

        const d = fd[0].split("-")
        // just year
        if (d.length == 1) {
            if (moment == "last")
                d.push('12')
            else
                d.push("01")
        }

        // just year and month
        if (d.length == 2) {
            d.push("01")
            if (moment == "last")
                return `addSeconds(toStartOfDay(toLastDayOfMonth(toDate('${d[0]}-${d[1]}-${d[2]}'))),-1)`
            else if (moment == "first")
                return `toStartOfDay(toLastDayOfMonth(toDate('${d[0]}-${d[1]}-${d[2]}')))`
        }
        return `parseDateTimeBestEffort('${d[0]}-${d[1]}-${d[2]}T${t[0]}:${t[1]}:${t[2]}${timezone}')`
    }
}

function parseConditions(op: string, value: string | number | string[]) {
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
            if (typeof value == "number" || typeof value == "string")
                return `= ${normalizeValue(value)}`;
        case "$ne":
            if (typeof value == "number" || typeof value == "string")
                return `!= ${normalizeValue(value)}`;

        case "$includes":
            return `LIKE '%${value}%'`;
        case "$notIncludes":
            return `NOT LIKE '%${value}%'`;
        case "$empty":
            return `IS NULL`;
        case "$notEmpty":
            return `IS NOT NULL`;

        case "$dateOn":
            return `= ${normalizeDateValue(value.toString())}`;
        case "$dateNotOn":
            return `!= ${normalizeDateValue(value.toString())}`;
        case "$dateBefore":
            return `< ${normalizeDateValue(value.toString(), "first")}`;
        case "$dateAfter":
            return `> ${normalizeDateValue(value.toString(), "last")}`;
        case "$dateNotBefore":
            return `>= ${normalizeDateValue(value.toString(), "last")}`;
        case "$dateNotAfter":
            return `<= ${normalizeDateValue(value.toString(), "first")}`;

        case "$in":
            if (Array.isArray(value))
                return `IN [${value.reduce((ac, ne) => `,'${ne}'${ac}`, "").slice(1)}]`;
        case "$notIn":
            if (Array.isArray(value))
                return `IN [${value.reduce((ac, ne) => `,'${ne}'${ac}`, "").slice(1)}]`;

        case "$isTruly":
            return ` = true`;
        case "$isFalsy":
            return ` = false`;
        case "$notIn":
            if (Array.isArray(value))
                return `IN [${value.reduce((ac, ne) => `,'${ne}'${ac}`, "").slice(1)}]`;

        case "$dateBetween":
            if (Array.isArray(value))
                return `BETWEEN ${normalizeDateValue(value[0] + value[3], "first")} AND ${normalizeDateValue(value[1] + value[3], "last")}`;
        default:
            throw new Error(`Unknown Operator: ${op}`);
    }
}
