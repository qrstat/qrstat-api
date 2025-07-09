// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {
    setDefaultRoles(strapi)
      .then(() => {
        console.log("Default roles have been set successfully.");
      })
      .catch((error) => {
        console.error("Error setting default roles:", error);
      });
    seedRolesPermissions(strapi)
      .then(() => {
        console.log("Default permissions have been set successfully.");
      })
      .catch((error) => {
        console.error("Error setting default permissions:", error);
      });
  },
};

const setDefaultRoles = async (strapi: any) => {
  const roles = await strapi.entityService.findMany(
    "plugin::users-permissions.role",
    {
      fields: ["name"],
    },
  );

  const roleNames = roles.map((role: any) => role.name);

  if (!roleNames.includes("Public")) {
    await strapi.entityService.create("plugin::users-permissions.role", {
      data: {
        name: "Public",
        description: "Public users with limited access",
        type: "public",
        permissions: [],
      },
    });
  }

  if (!roleNames.includes("Authenticated")) {
    await strapi.entityService.create("plugin::users-permissions.role", {
      data: {
        name: "Authenticated",
        description: "Authenticated users with standard access",
        type: "authenticated",
        permissions: [],
      },
    });
  }

  if (!roleNames.includes("Premium")) {
    await strapi.entityService.create("plugin::users-permissions.role", {
      data: {
        name: "Premium",
        description: "Premium users with extended features",
        type: "premium",
        permissions: [],
      },
    });
  }
};

const seedRolesPermissions = async (strapi) => {
  const roles = await strapi.entityService.findMany(
    "plugin::users-permissions.role",
    {
      fields: ["id", "name", "type"],
      populate: {
        permissions: true,
      },
    },
  );

  // Конфигурация permissions для каждой роли
  const rolePermissions: Record<string, Record<string, string[]>> = {
    Public: {
      // Public может только создавать ответы
      "api::response.response": ["create"],
      // Public может читать опции ответов (для отображения в опросах)
      "api::answer-option.answer-option": ["find", "findOne"],
      // Public может читать опросы (для участия)
      "api::poll.poll": ["find", "findOne"],
    },
    Authenticated: {
      // Authenticated может создавать и управлять своими опросами
      "api::poll.poll": ["find", "findOne", "create", "update", "delete"],
      // Authenticated может создавать и управлять опциями ответов
      "api::answer-option.answer-option": [
        "find",
        "findOne",
        "create",
        "update",
        "delete",
      ],
      // Authenticated может создавать ответы и просматривать статистику
      "api::response.response": ["find", "findOne", "create"],
    },
    Premium: {
      // Premium имеет все те же права что и Authenticated, но может создавать больше опросов
      "api::poll.poll": ["find", "findOne", "create", "update", "delete"],
      "api::answer-option.answer-option": [
        "find",
        "findOne",
        "create",
        "update",
        "delete",
      ],
      "api::response.response": ["find", "findOne", "create"],
    },
  };

  for (const role of roles) {
    const permissionsConfig = rolePermissions[role.name];
    if (!permissionsConfig) continue;

    const existingPermissions = await strapi.entityService.findMany(
      "plugin::users-permissions.permission",
      {
        filters: { role: role.id },
        fields: ["id", "action"],
      },
    );

    const existingPermissionsMap = new Map();
    existingPermissions.forEach((perm: any) => {
      const key = `${perm.action}`;
      existingPermissionsMap.set(key, perm.id);
    });

    for (const [contentType, actions] of Object.entries(permissionsConfig)) {
      for (const action of actions) {
        const fullAction = `${contentType}.${action}`;

        if (!existingPermissionsMap.has(fullAction)) {
          try {
            await strapi.entityService.create(
              "plugin::users-permissions.permission",
              {
                data: {
                  action: fullAction,
                  role: role.id,
                  enabled: true,
                },
              },
            );
          } catch (error) {
            console.error(
              `Error creating permission ${fullAction} for ${role.name}:`,
              error,
            );
          }
        } else {
          try {
            await strapi.entityService.update(
              "plugin::users-permissions.permission",
              existingPermissionsMap.get(fullAction),
              {
                data: {
                  enabled: true,
                },
              },
            );
          } catch (error) {
            console.error(
              `Error updating permission ${fullAction} for ${role.name}:`,
              error,
            );
          }
        }
      }
    }
  }
};
