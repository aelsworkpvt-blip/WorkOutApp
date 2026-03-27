import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { normalizePgConnectionString } from "../src/lib/pg-connection-string";
import { ensureWorkoutTemplatesSeeded } from "../src/lib/workout-template-bootstrap";

async function main() {
  const pool = new Pool({
    connectionString: normalizePgConnectionString(process.env.DATABASE_URL),
  });

  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
  });

  try {
    await ensureWorkoutTemplatesSeeded(prisma);

    const withDemoMedia = await prisma.exerciseTemplate.count({
      where: {
        demoVideoUrl: {
          not: null,
        },
      },
    });

    console.log(
      `Synced workout templates. Exercise templates with demo media: ${withDemoMedia}`,
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
