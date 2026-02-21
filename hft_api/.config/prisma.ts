import * as std_path from "node:path";
import process from "node:process";
import { defineConfig } from "prisma/config";

const cwd = process.cwd();

export default defineConfig({
  schema: std_path.join(cwd, "prisma", "schema.prisma"),
  migrations: {
    path: std_path.join(cwd, "prisma", "migrations"),
  },
  views: {
    path: std_path.join(cwd, "prisma", "views"),
  },
  typedSql: {
    path: std_path.join(cwd, "prisma", "queries"),
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
