export const logger = (words: string) => {
  const now = new Date();
  console.log(now.toUTCString(), "🌈 wifi", `====  ${words}`);
};
