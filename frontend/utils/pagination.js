// < 1 2 3 ... 10 >
// < 1 ... 8 9 10 >
// < 1 ... 5 6 7 ... 10 >

export function getPaginationRange(current, totalPages) {
  if (totalPages <= 1) return [1];

  const currentPage = Math.max(1, Math.min(current, totalPages));

  // 작은 페이지는 전부 출력
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [1];

  const isNearStart = currentPage <= 3;
  const isNearEnd = currentPage >= totalPages - 2;

  if (isNearStart) {
    pages.push(2, 3);
    pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  if (isNearEnd) {
    pages.push("...");
    pages.push(totalPages - 2, totalPages - 1, totalPages);
    return pages;
  }

  // 중간
  pages.push("...");
  pages.push(currentPage - 1, currentPage, currentPage + 1);
  pages.push("...");
  pages.push(totalPages);

  return pages;
}
