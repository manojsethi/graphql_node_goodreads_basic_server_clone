import { GraphQLError } from "graphql";
import { AuthChecker } from "type-graphql";
import Context from "../interfaces/context.interface";

const AuthValidator: AuthChecker<Context> = ({ context }) => {
  const result = context.user != null;
  if (!result) {
    context.res.clearCookie("accessToken");
    throw new GraphQLError("Unauthorized", {
      extensions: {
        code: "Unauthorized",
      },
    });
  }
  return result;
};

export default AuthValidator;
