import IEntry from "./IEntry";


interface ITransaction {
    _id?: any,
    balanced?: boolean,
    type?: string,
    description?: string,
    recurStartDate?: Date,
    recurEndDate?: Date,
    recurNextDate?: Date,
    entries?: IEntry[]
}

export default ITransaction;