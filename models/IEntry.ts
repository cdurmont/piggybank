interface IEntry {
    _id?: any,
    date?: Date,
    account?: any,
    transaction?: any,
    credit?: number,
    debit?: number,
    reference?: string,
    description?: string
}

export default IEntry;