import { FastifyInstance } from "fastify";
import { dateUTC } from "src/helper/date_utc";
import { pointsHelper } from "../helper/points";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function gameRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/pools/:id/games",
    { onRequest: [authenticate] },
    async (request, reply) => {
      const getPoolParams = z.object({
        id: z.string(),
      });
      const { id } = getPoolParams.parse(request.params);

      const games = await prisma.game.findMany({
        orderBy: {
          date: "desc",
        },
        include: {
          guesses: {
            where: {
              participant: {
                userId: request.user.sub,
                poolId: id,
              },
            },
          },
        },
      });

      return games.map((game) => {
        return {
          ...game,
          guess: game.guesses.length > 0 ? game.guesses[0] : null,
          guesses: undefined,
          isExpired: dateUTC(Date.now()) > game.date ? true : false,
        };
      });
    },
  );

  fastify.post("/games", async (request, reply) => {
    const createGuessBody = z.object({
      firstTeamCountryCode: z.string(),
      secondTeamCountryCode: z.string(),
      date: z.string(),
    });

    const { firstTeamCountryCode, secondTeamCountryCode, date } =
      createGuessBody.parse(request.body);

    const game = await prisma.game.create({
      data: {
        date,
        firstTeamCountryCode,
        secondTeamCountryCode,
      },
    });

    return game;
  });

  fastify.put("/games/:id", async (request, reply) => {
    const getGameParam = z.object({
      id: z.string(),
    });

    const updateGameBody = z.object({
      firstTeamPoints: z.number(),
      secondTeamPoints: z.number(),
    });

    const { id } = getGameParam.parse(request.params);

    const { firstTeamPoints, secondTeamPoints } = updateGameBody.parse(
      request.body,
    );

    const gameExists = await prisma.game.findUnique({
      where: {
        id,
      },
    });

    if (!gameExists) {
      return reply.status(400).send({
        message: "This game do not exists.",
      });
    }

    await prisma.game.update({
      where: {
        id,
      },
      data: {
        firstTeamPoints,
        secondTeamPoints,
      },
    });

    const guesses = await prisma.guess.findMany({
      where: {
        gameId: id,
      },
    });

    for (let g = 0; g < guesses.length; g++) {
      const score = pointsHelper(
        guesses[g].firstTeamPoints,
        guesses[g].secondTeamPoints,
        firstTeamPoints,
        secondTeamPoints,
      );
      await prisma.guess.update({
        where: {
          id: guesses[g].id,
        },
        data: {
          points: score,
        },
      });
    }

    const sum = await prisma.guess.groupBy({
      by: ["participantId"],
      _sum: { points: true },
      orderBy: {
        _sum: {
          points: "desc",
        },
      },
    });

    for (let r = 0; r < sum.length; r++) {
      await prisma.participant.update({
        where: {
          id: sum[r].participantId,
        },
        data: {
          points: sum[r]._sum.points,
        },
      });
    }

    return { message: "Game full time" };
  });
}
