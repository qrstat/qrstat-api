/**
 * answer-option controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::answer-option.answer-option",
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized();
      }

      const { data } = ctx.request.body;

      const { text, type, poll } = data;

      const answerOption = await strapi.entityService.create(
        "api::answer-option.answer-option",
        {
          data: {
            text,
            type,
            poll,
            userId: user.id,
          },
        },
      );

      return ctx.send({ answerOption });
    },
  }),
);
