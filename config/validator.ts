import Ajv from "ajv";

const ajv = new Ajv();
import * as userSchema from '../public/schema/IUser.schema.json';
import * as accountSchema from '../public/schema/IAccount.schema.json';
import * as transactionSchema from '../public/schema/ITransaction.schema.json';
import * as entrySchema from '../public/schema/IEntry.schema.json';
import * as permissionSchema from '../public/schema/IPermission.schema.json';
import * as associationSchema from '../public/schema/IAssociation.schema.json';


ajv.addSchema(userSchema, "user");
ajv.addSchema(accountSchema, "account");
ajv.addSchema(transactionSchema, "transaction");
ajv.addSchema(entrySchema, "entry");
ajv.addSchema(permissionSchema, "permission");
ajv.addSchema(associationSchema, "association");

export default ajv;