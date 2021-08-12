import { MikroORM } from "@mikro-orm/core";
import path from "path/posix";
import { __prod__ } from "./constants";
import { Post } from "./entities/Posts";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
    disableForeignKeys : false
  },
  entities: [Post],
  dbName: "lireddit",
  user: "postgres",
  password: "postgres",
  debug: !__prod__,
  type: "postgresql",
} as Parameters<typeof MikroORM.init>[0];
