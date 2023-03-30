import * as dotenv from "dotenv";
var { parsed } = dotenv.config();

interface IEnvironmentConfig {
  MONGODB_URI: string;
  JWT_SECRET: string;
}
var EnvironmentConfig: IEnvironmentConfig = <IEnvironmentConfig>(parsed as any);
export default EnvironmentConfig;
