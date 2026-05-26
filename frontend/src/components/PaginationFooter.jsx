import { ChevronLeft, ChevronRight } from 'lucide-react';

const getPageButtons = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) pages.push('start-ellipsis');
  for (let current = start; current <= end; current += 1) pages.push(current);
  if (end < totalPages - 1) pages.push('end-ellipsis');
  pages.push(totalPages);

  return pages;
};

const PaginationFooter = ({
  page,
  totalItems,
  pageSize,
  onPageChange,
  className = '',
}) => {
  if (totalItems <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  const pageButtons = getPageButtons(page, totalPages);
  const canGoBack = page > 1;
  const canGoNext = page < totalPages;

  const goToPage = (nextPage) => {
    onPageChange(Math.min(Math.max(nextPage, 1), totalPages));
  };

  const progress = Math.min(100, Math.max(0, (page / totalPages) * 100));
  const navButtonClass = 'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-40 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-primary/15';
  const pageButtonClass = 'inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-transparent px-3 text-sm font-bold text-slate-500 transition-all hover:bg-slate-100 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800';

  return (
    <div className={`border-t border-slate-200/70 bg-gradient-to-r from-white/90 via-slate-50/90 to-white/90 px-4 py-4 dark:border-slate-800/80 dark:from-slate-950/90 dark:via-slate-900/80 dark:to-slate-950/90 sm:px-6 ${className}`}>
      <div className="flex flex-col gap-3 sm:hidden">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Showing</p>
            <p className="text-sm font-black text-slate-800 dark:text-white">
              {from}-{to} <span className="text-slate-400">of {totalItems}</span>
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
            Page {page}/{totalPages}
          </span>
        </div>
        <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={() => goToPage(page - 1)}
          disabled={!canGoBack}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:border-primary/30 hover:text-primary disabled:pointer-events-none disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          Previous
        </button>
        <button
          type="button"
          onClick={() => goToPage(page + 1)}
          disabled={!canGoNext}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-primary/20 transition-colors hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-40"
        >
          Next
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </button>
        </div>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between sm:gap-6">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Results</p>
            <p className="text-sm font-black text-slate-800 dark:text-white">
              {from}-{to} <span className="font-semibold text-slate-400">of {totalItems}</span>
            </p>
          </div>
          <div className="hidden lg:block min-w-40">
            <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Page {page}</span>
              <span>{totalPages}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        <nav aria-label="Pagination" className="inline-flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/80 p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={!canGoBack}
            className={navButtonClass}
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft aria-hidden="true" className="h-5 w-5" />
          </button>
          {pageButtons.map(item => (
            typeof item === 'number' ? (
              <button
                type="button"
                key={item}
                onClick={() => goToPage(item)}
                aria-current={item === page ? 'page' : undefined}
                className={item === page
                  ? 'inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-primary px-3 text-sm font-black text-white shadow-sm shadow-primary/30 transition-all'
                  : pageButtonClass}
              >
                {item}
              </button>
            ) : (
              <span
                key={item}
                className="inline-flex h-10 min-w-10 items-center justify-center px-2 text-sm font-black text-slate-400"
              >
                ...
              </span>
            )
          ))}
          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={!canGoNext}
            className={navButtonClass}
          >
            <span className="sr-only">Next</span>
            <ChevronRight aria-hidden="true" className="h-5 w-5" />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default PaginationFooter;
