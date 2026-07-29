import * as schemas from "../../../types.js";
import type { ToolDescriptor } from "../registry.js";

export const fileDescriptors: ToolDescriptor[] = [
  {
    name: "upload_file",
    schema: schemas.UploadFileSchema,
    keys: ["channelId", "filePath", "fileName", "content"],
  },
];
