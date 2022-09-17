export const envs = () => ({
  port: parseInt(process.env.PORT),
  mongodb_uri: process.env.MONGODB_URI,
  jwt_secret: process.env.JWT_SECRET,
  jwt_exp: process.env.JWT_EXP,
});
