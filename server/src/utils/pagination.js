const getPagination = (page = 1, limit = 10) => {
  const parsedPage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 100);
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip,
  };
};

module.exports = getPagination;
