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

      const entity = await strapi.entityService.create("api::poll.poll", {
        data: {
          ...data,
          userId: user.id,
        },
      });

      return ctx.send(entity);
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
