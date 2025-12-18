import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "./prisma",
  migrations: {
    path: "./migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
});