import Ajv from "ajv";

const ajv = new Ajv();
import * as userSchema from '../public/schema/IUser.schema.json';
import * as accountSchema from '../public/schema/IAccount.schema.json';

ajv.addSchema(userSchema, "user");
ajv.addSchema(accountSchema, "account");

export default ajv;