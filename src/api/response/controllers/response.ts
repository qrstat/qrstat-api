/**
 * response controller
 */

import { factories } from "@strapi/strapi";
import {
  fillMissingDates,
  findAndGroupAllTime,
  findAndGroupMonth,
  findAndGroupWeek,
  findAndGroupYear,
} from "./findAndGroup";
import { TimeIntervals } from "../../../../types/timeIntervals";

export default factories.createCoreController(
  "api::response.response",
  ({ strapi }) => ({
    async create(ctx) {
      const { data } = ctx.request.body;
      const { poll, answerOption } = data;

      if (!poll || !answerOption) {
        return ctx.badRequest({
          data: null,
          error: {
            status: 400,
            name: "BadRequestError",
            message: "Poll and answerOption are required",
            details: {},
          },
        });
      }

      const response = await strapi.entityService.create(
        "api::response.response",
        {
          data: {
            poll,
            answerOption,
          },
        },
      );

      return ctx.send({ response });
    },

    async find(ctx) {
      const { pollID, timeInterval } = ctx.query;

      if (!pollID) return ctx.badRequest("Poll ID is required");
      if (!timeInterval) return ctx.badRequest("Time interval is required");
      if (
        !Object.values(TimeIntervals).includes(timeInterval as TimeIntervals)
      ) {
        return ctx.badRequest(
          `Time interval must be one of ${Object.values(TimeIntervals).join(", ")}`,
        );
      }

      ctx.query = {
        ...ctx.query,
      };

      const { id } = await strapi.db.query("api::poll.poll").findOne({
        where: { documentId: pollID },
        select: ["id"],
      });

      if (!id) return ctx.notFound("Poll not found");

      switch (timeInterval) {
        case TimeIntervals.WEEK: {
          const data = await findAndGroupWeek(id);
          return fillMissingDates(data);
        }
        case TimeIntervals.MONTH: {
          const data = await findAndGroupMonth(id);
          return fillMissingDates(data, 30);
        }
        case TimeIntervals.YEAR: {
          return findAndGroupYear(id);
        }
        case TimeIntervals.ALL: {
          return findAndGroupAllTime(id);
        }
        default:
          return ctx.badRequest(
            `Time interval must be one of ${Object.values(TimeIntervals).join(", ")}`,
          );
      }
    },
  }),
);
