import {
  MAX_POLLS_AUTHENTICATED,
  MAX_POLLS_PREMIUM,
  MAX_POLLS_PUBLIC,
} from "../constants/polls";
import {
  AUTHENTICATED_ROLE,
  PREMIUM_ROLE,
  PUBLIC_ROLE,
} from "../constants/roles";

export default (config: any, { strapi }: { strapi: any }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    if (
      ctx.request.url.includes("plugin::users-permissions.user") &&
      ctx.request.method === "PUT"
    ) {
      const { role } = ctx.request.body;

      if (role) {
        const connectedRoles = role.connect || [];
        const disconnectedRoles = role.disconnect || [];

        if (connectedRoles.length > 0) {
          const roleId = connectedRoles[0].id; // Берем первый подключаемый
          const roleData = await strapi.entityService.findOne(
            "plugin::users-permissions.role",
            roleId,
            { fields: ["name"] },
          );

          if (roleData) {
            switch (roleData.name) {
              case AUTHENTICATED_ROLE:
                ctx.request.body.maxPolls = MAX_POLLS_AUTHENTICATED;
                ctx.request.body.clientRole = AUTHENTICATED_ROLE;
                break;
              case PREMIUM_ROLE:
                ctx.request.body.maxPolls = MAX_POLLS_PREMIUM;
                ctx.request.body.clientRole = PREMIUM_ROLE;
                break;
              default:
                ctx.request.body.maxPolls = MAX_POLLS_PUBLIC;
                ctx.request.body.clientRole = PUBLIC_ROLE;
            }
          }
        }
      }
    }
    await next();
  };
};
