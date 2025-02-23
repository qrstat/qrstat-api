/**
 * response controller
 */

import { factories } from "@strapi/strapi";

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
  }),
);
