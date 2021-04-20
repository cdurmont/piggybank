import IEntry from "./IEntry";


interface ITransaction {
    _id?: any,
    balanced?: boolean,
    description?: string,
    entries?: IEntry[]
}

export default ITransaction;