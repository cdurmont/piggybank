
interface IUser {
    _id?: any,
    login?: string,
    salt?: string,
    hash?: string,
    apikey?: string,
    name?: string,
    admin?: boolean,
    displayName?: string    // virtual, defined in schema
}

export default IUser;