import { useCallback, useMemo, useState } from 'react';

export const usePagination = (items, pageSize = 10, resetKey = '') => {
  const [pagination, setPagination] = useState({ page: 1, resetKey });
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const requestedPage = pagination.resetKey === resetKey ? pagination.page : 1;
  const page = Math.min(Math.max(requestedPage, 1), totalPages);

  const setPage = useCallback((nextPage) => {
    setPagination({
      page: Math.min(Math.max(nextPage, 1), totalPages),
      resetKey,
    });
  }, [resetKey, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return { page, pageSize, totalItems, totalPages, paginatedItems, setPage };
};
