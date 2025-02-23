/**
 * poll controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::poll.poll",
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized();
      }

      const { data } = ctx.request.body;

      const { affirmativeText, negativeText, ...pollData } = data;

      if (!affirmativeText || !negativeText) {
        return ctx.badRequest("Affirmative and negative texts are required");
      }

      const poll = await strapi.entityService.create("api::poll.poll", {
        data: {
          ...pollData,
          userId: user.id,
        },
      });

      const answerOptions = await Promise.all([
        strapi.entityService.create("api::answer-option.answer-option", {
          data: {
            text: affirmativeText || "Yes",
            type: "affirmative",
            poll: poll.id,
            userId: user.id,
          },
        }),
        strapi.entityService.create("api::answer-option.answer-option", {
          data: {
            text: negativeText || "No",
            type: "negative",
            poll: poll.id,
            userId: user.id,
          },
        }),
      ]);

      return ctx.send({ poll, answerOptions });
    },

    async find(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized("You must be logged in");
      }

      ctx.query = {
        ...ctx.query,
        filters: { userId: user.id },
      };

      return await super.find(ctx);
    },

    async findOne(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized("You must be logged in");
      }

      ctx.query = {
        ...ctx.query,
        filters: { userId: user.id },
      };

      return await super.findOne(ctx);
    },
  }),
);
