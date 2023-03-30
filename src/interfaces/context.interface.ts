import { ExpressContextFunctionArgument } from "@apollo/server/dist/esm/express4";
import { IDataloaders } from "src/interfaces/dataloader.interface";
import { User } from "../schema/user.schema";

interface Context extends ExpressContextFunctionArgument {
  user?: User;
  loaders?: IDataloaders;
}

export default Context;
