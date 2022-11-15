import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.game.create({
    data: {
      date: "2022-11-15T16:00:00.000Z",
      firstTeamCountryCode: "DE",
      secondTeamCountryCode: "BR",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
