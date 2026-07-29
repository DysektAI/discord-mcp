export const rolesTools = [
  {
        name: "create_role",
        description: "Create new server role",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            name: {
              type: "string",
              description: "Name of the role",
            },
            color: {
              type: "string",
              description: "Role color (hex format)",
            },
            permissions: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of permission names",
            },
          },
          required: ["name"],
        },
      },
  {
        name: "delete_role",
        description: "Remove existing role",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            roleId: {
              type: "string",
              description: "Role ID",
            },
          },
          required: ["roleId"],
        },
      },
  {
        name: "edit_role",
        description: "Modify role properties (name, color, permissions)",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            roleId: {
              type: "string",
              description: "Role ID",
            },
            name: {
              type: "string",
              description: "New name for the role",
            },
            color: {
              type: "string",
              description: "New color (hex format)",
            },
            permissions: {
              type: "array",
              items: {
                type: "string",
              },
              description: "New permissions array",
            },
          },
          required: ["roleId"],
        },
      },
  {
        name: "add_role_to_member",
        description: "Assign role to member",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            userId: {
              type: "string",
              description: "Discord user ID",
            },
            roleId: {
              type: "string",
              description: "Role ID",
            },
          },
          required: ["userId", "roleId"],
        },
      },
  {
        name: "remove_role_from_member",
        description: "Remove role from member",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            userId: {
              type: "string",
              description: "Discord user ID",
            },
            roleId: {
              type: "string",
              description: "Role ID",
            },
          },
          required: ["userId", "roleId"],
        },
      },
  {
        name: "get_roles",
        description: "List all server roles",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
          },
          required: [],
        },
      },
  {
        name: "set_role_positions",
        description: "Reorder role hierarchy",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            rolePositions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  roleId: {
                    type: "string",
                    description: "Role ID",
                  },
                  position: {
                    type: "number",
                    description: "New position",
                  },
                },
                required: ["roleId", "position"],
              },
              description: "Array of role position updates",
            },
          },
          required: ["rolePositions"],
        },
      }
];
