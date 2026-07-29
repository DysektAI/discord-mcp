import { channelCreateMethods } from "./channels/create.js";
import { channelEditMethods } from "./channels/edit.js";
import { channelPrivacyMethods } from "./channels/privacy.js";
import { channelCategoryMethods } from "./channels/category.js";
import { channelListingMethods } from "./channels/listing.js";
import { channelBatchMethods } from "./channels/batch.js";

export const channelsMethods = {
  ...channelCreateMethods,
  ...channelEditMethods,
  ...channelPrivacyMethods,
  ...channelCategoryMethods,
  ...channelListingMethods,
  ...channelBatchMethods,
};

export type ChannelsMethods = typeof channelsMethods;
