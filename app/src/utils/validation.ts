export const validateLinkedInUrl = (url: string) => {
  const regex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_%]+\/?$/;
  return regex.test(url);
};
