import { commitlintEmojiParser } from "committier/commitlint-emoji-parser";

export default {
  extends: ["@commitlint/config-conventional"],
  parserPreset: commitlintEmojiParser,
};
