import IEntry from "./IEntry";


interface ITransaction {
    _id?: any,
    balanced?: boolean,
    entries?: IEntry[]
}

export default ITransaction;