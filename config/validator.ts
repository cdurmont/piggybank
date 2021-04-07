import Ajv from "ajv";

const ajv = new Ajv();
import * as userSchema from '../public/schema/IUser.schema.json';

ajv.addSchema(userSchema, "user");

export default ajv;