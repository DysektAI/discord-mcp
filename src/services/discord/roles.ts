import {
  PermissionFlagsBits,
  Role,
  ColorResolvable,
} from "discord.js";

import type { DiscordService } from "./service.js";

export const rolesMethods = {
  async createRole(this: DiscordService, guildId: string | undefined, name: string, color?: string, permissions?: string[]): Promise<string> {
      this.ensureReady();
      const resolvedGuildId = this.resolveGuildId(guildId);
      
      const guild = this.client.guilds.cache.get(resolvedGuildId);
      if (!guild) {
        throw new Error("Discord server not found by guildId");
      }
  
      // Check bot permissions
      const botMember = guild.members.cache.get(this.client.user!.id);
      if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles)) {
        throw new Error("Bot doesn't have permission to manage roles");
      }
  
      try {
        const roleOptions: any = {
          name,
          mentionable: true
        };
  
        // Set color if provided
        if (color) {
          roleOptions.color = color as ColorResolvable;
        }
  
        // Set permissions if provided
        if (permissions && permissions.length > 0) {
          const permissionBits = [];
          for (const perm of permissions) {
            if (perm in PermissionFlagsBits) {
              permissionBits.push(PermissionFlagsBits[perm as keyof typeof PermissionFlagsBits]);
            }
          }
          if (permissionBits.length > 0) {
            roleOptions.permissions = permissionBits;
          }
        }
  
        const role = await guild.roles.create(roleOptions);
        
        return `Successfully created role: ${role.name} (ID: ${role.id}) with color ${role.hexColor}`;
      } catch (error) {
        throw new Error(`Failed to create role: ${error instanceof Error ? error.message : String(error)}`);
      }
    },

  async deleteRole(this: DiscordService, guildId: string | undefined, roleId: string): Promise<string> {
      this.ensureReady();
      const resolvedGuildId = this.resolveGuildId(guildId);
      
      const guild = this.client.guilds.cache.get(resolvedGuildId);
      if (!guild) {
        throw new Error("Discord server not found by guildId");
      }
  
      // Check bot permissions
      const botMember = guild.members.cache.get(this.client.user!.id);
      if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles)) {
        throw new Error("Bot doesn't have permission to manage roles");
      }
  
      try {
        const role = guild.roles.cache.get(roleId);
        if (!role) {
          throw new Error("Role not found by roleId");
        }
  
        // Check role hierarchy
        const botHighestRole = botMember.roles.highest;
        if (role.position >= botHighestRole.position) {
          throw new Error("Cannot delete this role (insufficient permissions or role hierarchy)");
        }
  
        const roleName = role.name;
        await role.delete();
        
        return `Successfully deleted role: ${roleName} (ID: ${roleId})`;
      } catch (error) {
        throw new Error(`Failed to delete role: ${error instanceof Error ? error.message : String(error)}`);
      }
    },

  async editRole(this: DiscordService, guildId: string | undefined, roleId: string, name?: string, color?: string, permissions?: string[]): Promise<string> {
      this.ensureReady();
      const resolvedGuildId = this.resolveGuildId(guildId);
      
      const guild = this.client.guilds.cache.get(resolvedGuildId);
      if (!guild) {
        throw new Error("Discord server not found by guildId");
      }
  
      // Check bot permissions
      const botMember = guild.members.cache.get(this.client.user!.id);
      if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles)) {
        throw new Error("Bot doesn't have permission to manage roles");
      }
  
      try {
        const role = guild.roles.cache.get(roleId);
        if (!role) {
          throw new Error(`Role not found: ${roleId}`);
        }
  
        // Cannot edit @everyone role
        if (role.id === guild.id) {
          throw new Error("Cannot edit @everyone role");
        }
  
        // Check role hierarchy - bot cannot edit roles at or above its highest role
        const botHighestRole = botMember.roles.highest;
        if (role.position >= botHighestRole.position && role.id !== botMember.roles.highest.id) {
          throw new Error(`Cannot edit role "${role.name}" (position ${role.position}) - bot's highest role "${botHighestRole.name}" is at position ${botHighestRole.position}. Bot can only edit roles below its highest role.`);
        }
  
        const editOptions: any = {};
        const changes: string[] = [];
  
        // Validate and set name
        if (name !== undefined) {
          if (name.length === 0 || name.length > 100) {
            throw new Error("Role name must be between 1 and 100 characters");
          }
          editOptions.name = name;
          changes.push(`name to "${name}"`);
        }
  
        // Validate and set color
        if (color !== undefined) {
          // Handle different color formats
          let validColor = color;
          if (color.toLowerCase() === 'default' || color.toLowerCase() === 'none') {
            validColor = '#000000'; // Default color
          } else if (color.startsWith('#')) {
            // Validate hex color
            if (!/^#[0-9A-F]{6}$/i.test(color)) {
              throw new Error(`Invalid hex color format: ${color}. Use format #RRGGBB (e.g., #FF0000 for red)`);
            }
            validColor = color;
          } else if (/^[0-9A-F]{6}$/i.test(color)) {
            // Add # if missing
            validColor = `#${color}`;
          } else {
            throw new Error(`Invalid color format: ${color}. Use hex format #RRGGBB or 'default'`);
          }
          
          editOptions.color = validColor as ColorResolvable;
          changes.push(`color to ${validColor}`);
        }
  
        // Validate and set permissions
        if (permissions !== undefined && permissions.length > 0) {
          const permissionBits = [];
          const invalidPermissions = [];
          
          for (const perm of permissions) {
            if (perm in PermissionFlagsBits) {
              permissionBits.push(PermissionFlagsBits[perm as keyof typeof PermissionFlagsBits]);
            } else {
              invalidPermissions.push(perm);
            }
          }
          
          if (invalidPermissions.length > 0) {
            const validPermissions = Object.keys(PermissionFlagsBits).slice(0, 10).join(', '); // Show first 10
            throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}. Valid permissions include: ${validPermissions}... (use get_roles to see all permissions)`);
          }
          
          if (permissionBits.length > 0) {
            editOptions.permissions = permissionBits;
            changes.push(`permissions (${permissions.length} permissions set)`);
          }
        }
  
        if (Object.keys(editOptions).length === 0) {
          return "No changes specified for role edit";
        }
  
        const updatedRole = await role.edit(editOptions);
        
        return `Successfully edited role "${updatedRole.name}" (ID: ${roleId}). Changed: ${changes.join(', ')}`;
      } catch (error) {
        throw new Error(`Failed to edit role: ${error instanceof Error ? error.message : String(error)}`);
      }
    },

  async addRoleToMember(this: DiscordService, guildId: string | undefined, userId: string, roleId: string): Promise<string> {
      this.ensureReady();
      const resolvedGuildId = this.resolveGuildId(guildId);
      
      const guild = this.client.guilds.cache.get(resolvedGuildId);
      if (!guild) {
        throw new Error("Discord server not found by guildId");
      }
  
      // Check bot permissions
      const botMember = guild.members.cache.get(this.client.user!.id);
      if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles)) {
        throw new Error("Bot doesn't have permission to manage roles");
      }
  
      try {
        const member = await guild.members.fetch(userId);
        if (!member) {
          throw new Error("Member not found in this server");
        }
  
        const role = guild.roles.cache.get(roleId);
        if (!role) {
          throw new Error("Role not found by roleId");
        }
  
        // Check role hierarchy
        const botHighestRole = botMember.roles.highest;
        if (role.position >= botHighestRole.position) {
          throw new Error("Cannot assign this role (insufficient permissions or role hierarchy)");
        }
  
        // Check if member already has the role
        if (member.roles.cache.has(roleId)) {
          return `Member ${member.user.username} already has the role ${role.name}`;
        }
  
        await member.roles.add(role);
        
        return `Successfully added role ${role.name} to ${member.user.username} (ID: ${userId})`;
      } catch (error) {
        throw new Error(`Failed to add role to member: ${error instanceof Error ? error.message : String(error)}`);
      }
    },

  async removeRoleFromMember(this: DiscordService, guildId: string | undefined, userId: string, roleId: string): Promise<string> {
      this.ensureReady();
      const resolvedGuildId = this.resolveGuildId(guildId);
      
      const guild = this.client.guilds.cache.get(resolvedGuildId);
      if (!guild) {
        throw new Error("Discord server not found by guildId");
      }
  
      // Check bot permissions
      const botMember = guild.members.cache.get(this.client.user!.id);
      if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles)) {
        throw new Error("Bot doesn't have permission to manage roles");
      }
  
      try {
        const member = await guild.members.fetch(userId);
        if (!member) {
          throw new Error("Member not found in this server");
        }
  
        const role = guild.roles.cache.get(roleId);
        if (!role) {
          throw new Error("Role not found by roleId");
        }
  
        // Check role hierarchy
        const botHighestRole = botMember.roles.highest;
        if (role.position >= botHighestRole.position) {
          throw new Error("Cannot remove this role (insufficient permissions or role hierarchy)");
        }
  
        // Check if member has the role
        if (!member.roles.cache.has(roleId)) {
          return `Member ${member.user.username} doesn't have the role ${role.name}`;
        }
  
        await member.roles.remove(role);
        
        return `Successfully removed role ${role.name} from ${member.user.username} (ID: ${userId})`;
      } catch (error) {
        throw new Error(`Failed to remove role from member: ${error instanceof Error ? error.message : String(error)}`);
      }
    },

  async getRoles(this: DiscordService, guildId: string | undefined): Promise<string> {
      this.ensureReady();
      const resolvedGuildId = this.resolveGuildId(guildId);
      
      const guild = this.client.guilds.cache.get(resolvedGuildId);
      if (!guild) {
        throw new Error("Discord server not found by guildId");
      }
  
      try {
        // Get the bot's highest role for permission context
        const botMember = guild.members.cache.get(this.client.user!.id);
        const botHighestRole = botMember?.roles.highest;
        const hasManageRoles = botMember?.permissions.has(PermissionFlagsBits.ManageRoles);
        
        const roles = guild.roles.cache.sort((a, b) => b.position - a.position);
        
        if (roles.size === 0) {
          return "No roles found in this server";
        }
        
        const formattedRoles = roles.map((role: Role) => {
          const memberCount = role.members.size;
          const isManageable = botHighestRole && role.position < botHighestRole.position && role.id !== guild.id;
          const isEveryone = role.id === guild.id;
          const permissions = role.permissions.toArray().join(', ') || 'None';
          
          return `- **${role.name}** (ID: \`${role.id}\`)
    - Color: ${role.hexColor}
    - Position: ${role.position}
    - Members: ${memberCount}
    - Mentionable: ${role.mentionable ? 'Yes' : 'No'}
    - Hoisted: ${role.hoist ? 'Yes' : 'No'}
    - Special: ${isEveryone ? '@everyone role' : 'Regular role'}
    - Bot can reposition: ${isManageable && hasManageRoles ? 'Γ£à Yes' : 'Γ¥î No'}${!isManageable && !isEveryone ? ` (${role.position >= (botHighestRole?.position || 0) ? 'higher/equal position' : 'permission issue'})` : ''}`;
        });
        
        return `≡ƒôï **Roles in ${guild.name}** (${formattedRoles.length} total)
  
  ≡ƒñû **Bot Status:**
  - Bot's highest role: **${botHighestRole?.name}** (Position: ${botHighestRole?.position})
  - Has "Manage Roles" permission: ${hasManageRoles ? 'Γ£à Yes' : 'Γ¥î No'}
  
  ≡ƒô¥ **Role Positioning Rules:**
  - Bot can only move roles **below** its highest role
  - @everyone role cannot be repositioned  
  - Positions are 0-based (0 = bottom, higher number = top)
  
  ≡ƒÄ¡ **Server Roles:**
  
  ${formattedRoles.join('\n\n')}`;
      } catch (error) {
        throw new Error(`Failed to fetch roles: ${error instanceof Error ? error.message : String(error)}`);
      }
    },

  async setRolePositions(this: DiscordService, guildId: string | undefined, rolePositions: Array<{roleId: string, position: number}>): Promise<string> {
      this.ensureReady();
      const resolvedGuildId = this.resolveGuildId(guildId);
      
      const guild = this.client.guilds.cache.get(resolvedGuildId);
      if (!guild) {
        throw new Error("Discord server not found by guildId");
      }
  
      // Check bot permissions
      const botMember = guild.members.cache.get(this.client.user!.id);
      if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles)) {
        throw new Error("Bot doesn't have permission to manage roles");
      }
  
      try {
        const botHighestRole = botMember.roles.highest;
        const positionChanges: Array<{role: Role, position: number}> = [];
  
        // Validate all roles and positions
        for (const { roleId, position } of rolePositions) {
          const role = guild.roles.cache.get(roleId);
          if (!role) {
            throw new Error(`Role not found: ${roleId}`);
          }
  
          // Skip @everyone role (it cannot be repositioned)
          if (role.id === guild.id) {
            throw new Error(`Cannot reposition @everyone role`);
          }
  
          // Check role hierarchy - bot cannot move roles at or above its highest role
          if (role.position >= botHighestRole.position && role.id !== botMember.roles.highest.id) {
            throw new Error(`Cannot reposition role "${role.name}" (position ${role.position}) - bot's highest role "${botHighestRole.name}" is at position ${botHighestRole.position}. Bot can only move roles below its highest role.`);
          }
  
          // Validate position is reasonable (Discord roles are 1-indexed, but we accept 0-based)
          if (position < 0) {
            throw new Error(`Invalid position ${position} for role ${role.name}. Position must be 0 or higher.`);
          }
  
          positionChanges.push({ role, position });
        }
  
        if (positionChanges.length === 0) {
          return "No roles to reposition";
        }
  
        // Apply position changes using the correct format for Discord.js
        await guild.roles.setPositions(positionChanges);
        
        const changedRoles = positionChanges.map(({ role, position }) => 
          `${role.name} (${role.id}) to position ${position}`
        ).join(', ');
        
        return `Successfully updated ${positionChanges.length} role positions: ${changedRoles}`;
      } catch (error) {
        throw new Error(`Failed to set role positions: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
};

export type RolesMethods = typeof rolesMethods;
