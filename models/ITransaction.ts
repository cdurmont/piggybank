import IEntry from "./IEntry";
import IUser from "./IUser";


interface ITransaction {
    _id?: any,
    balanced?: boolean,
    type?: string,
    description?: string,
    recurStartDate?: Date,
    recurEndDate?: Date,
    recurNextDate?: Date,
    owner?: IUser,
    entries?: IEntry[]
}

export default ITransaction;