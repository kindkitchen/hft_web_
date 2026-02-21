import { PrismaClient } from "../prisma/generated/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const {
  DATABASE_URL,
} = Deno.env.toObject();
async function main() {
  try {
    console.log(DATABASE_URL);
    const db = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: DATABASE_URL,
      }),
    });
    await db.$connect();
    await db.$disconnect();
  } catch (err) {
    console.warn(err);
  }

  console.log(DATABASE_URL);
}

if (import.meta.main) {
  await main();
}
