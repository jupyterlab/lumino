function objectSize(o) {
    if ( typeof o === 'boolean' ) {
        return 4
    } else if (typeof o === 'string' ) {
        return o.length * 2
    } else if (typeof o === 'number') {
        return 8
    } else if (typeof o === 'object') {
        return Object.values(o).map(v => objectSize(v)).reduce((a,b) => a+b, 0)
    } else {
        return 0
    }
}

function transactionSize(transaction) {
    return objectSize(transaction)
}


export default transactionSize;