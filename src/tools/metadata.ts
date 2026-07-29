type ToolClassification = {
  readOnly: boolean;
  destructive: boolean;
};

export function classifyTool(name: string): ToolClassification {
  const readOnlyPrefixes = [
    "get_",
    "list_",
    "find_",
    "read_",
    "search_",
    "export_",
  ];
  const destructiveNames = new Set([
    "bulk_delete_messages",
    "comprehensive_channel_management",
  ]);

  const readOnly = readOnlyPrefixes.some((prefix) => name.startsWith(prefix));

  const destructive =
    destructiveNames.has(name) ||
    name.startsWith("delete_") ||
    name.includes("_delete_");

  return { readOnly, destructive };
}

export function applyToolMetadata(tool: Record<string, any>): Record<string, any> {
  const destructiveHintOverrides = new Set(
    (process.env.MCP_DESTRUCTIVE_HINT_OVERRIDES || "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
  );
  const destructiveHintDisabled =
    process.env.MCP_DISABLE_DESTRUCTIVE_HINTS === "true";
  const { readOnly, destructive } = classifyTool(tool.name);
  const allowDestructiveHint =
    !destructiveHintDisabled && !destructiveHintOverrides.has(tool.name);
  const annotations = {
    readOnlyHint: readOnly,
    openWorldHint: readOnly ? false : false,
    destructiveHint: readOnly ? false : destructive && allowDestructiveHint,
  };
  const visibility = "public";

  return {
    ...tool,
    annotations,
    _meta: {
      ...(tool._meta || {}),
      "openai/visibility": visibility,
    },
  };
}
