import IAccount from "./IAccount";

interface IAssociation {
    _id?: any,
    regex?: string,
    account?: IAccount
}

export default IAssociation;