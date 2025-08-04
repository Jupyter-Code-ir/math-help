import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import CustomSelect from "./CustomSelect";

export default function DataTable({
  data,
  showDelete = true,
  onDelete,
  onSelect,
  maxHeight,
  maxW,
  enablePagination = true,
  defaultPageIndex = 0,
  pageSizesNumber = [5, 10, 20, 50, 100],
  onPageIndexChange,
}) {
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: defaultPageIndex,
    pageSize: 10,
  });
  const pageSizeOptions = pageSizesNumber.map((n) => ({
    label: `نمایش ${n} مورد`,
    value: n,
  }));
  const [pageSize, setPageSize] = useState(
    pageSizeOptions.find((option) => option.value === 10) || pageSizeOptions[0]
  );
  const [pageInput, setPageInput] = useState(defaultPageIndex + 1);

  const columns = useMemo(() => {
    const keys = Object.keys(data[0] || {});
    const tableCols = keys.map((key) => ({
      accessorKey: key,
      header: key,
      cell: ({ getValue }) => (
        <span
          className="block overflow-auto text-nowrap text-gray-100"
          style={{ maxWidth: typeof maxW === "number" ? `${maxW}px` : "200px" }}
        >
          {getValue()?.toString()}
        </span>
      ),
    }));

    const actionCol = {
      header: "عملیات",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-3 justify-center">
          {showDelete && (
            <button
              onClick={() => {
                onDelete?.(row.index);
                if (selectedRowIndex === row.index) {
                  setSelectedRowIndex(null);
                  onSelect?.(null, null);
                }
              }}
              className="group relative flex items-center justify-center px-3 py-1.5 backdrop-blur-lg shadow-sm shadow-black/40 hover:shadow-black/50 text-white rounded-lg transition-all duration-500 shadow-sm hover:shadow-lg hover:scale-105"
              title="حذف ایتم"
            >
              <i className="fa-light fa-trash"></i>
            </button>
          )}
        </div>
      ),
    };

    return [...tableCols, showDelete ? actionCol : null].filter(Boolean);
  }, [data, showDelete, onDelete, selectedRowIndex]);

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: enablePagination ? pagination : undefined,
    },
    onPaginationChange: enablePagination
      ? (updater) => {
          setPagination((prev) => {
            const newPagination = typeof updater === "function" ? updater(prev) : updater;
            if (newPagination.pageIndex !== prev.pageIndex) {
              setTimeout(() => onPageIndexChange?.(newPagination.pageIndex), 0);
            }
            return newPagination;
          });
        }
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
  });

  useEffect(() => {
    const timeout = setTimeout(() => setIsFirstLoad(false), 50);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setPagination((prev) => ({ ...prev, pageIndex: defaultPageIndex }));
      setPageInput(defaultPageIndex + 1);
    }, 0);
  }, [defaultPageIndex]);

  useEffect(() => {
    setPageInput(pagination.pageIndex + 1);
  }, [pagination.pageIndex]);

  const handlePageInputChange = (e) => {
    const value = e.target.value;
    setPageInput(value);
  };

  const handlePageInputSubmit = () => {
    const pageNum = parseInt(pageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= table.getPageCount()) {
      const newPageIndex = pageNum - 1;
      table.setPageIndex(newPageIndex);
      setPagination((prev) => ({ ...prev, pageIndex: newPageIndex }));
      setTimeout(() => onPageIndexChange?.(newPageIndex), 0);
    } else {
      setPageInput(pagination.pageIndex + 1);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div
        className="overflow-auto p-4 pt-00"
        style={{
          maxHeight: enablePagination
            ? `calc(${maxHeight ? `${maxHeight}px` : "400px"} - 100px)`
            : maxHeight
            ? `${maxHeight}px`
            : "400px",
        }}
      >
        <table className="w-full text-white text-right border-separate border-spacing-y-3">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="mx-4 backdrop-blur-xl shadow-sm shadow-black/40 rounded-lg"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler() || (() => {})}
                    className="cursor-pointer text-center p-3 font-semibold text-gray-100 select-none transition-all duration-500 hover:shadow-lg shadow-black hover:bg-blue-950/20 rounded-lg"
                  >
                    <div className="flex items-center text-nowrap justify-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <span className="text-gray-400">
                        {header.column.getIsSorted() === "asc" && (
                          <i className="fa-light fa-arrow-up text-black"></i>
                        )}
                        {header.column.getIsSorted() === "desc" && (
                          <i className="fa-light fa-arrow-down text-black"></i>
                        )}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            <AnimatePresence>
              {table.getRowModel().rows.map((row) => (
                <motion.tr
                  initial={isFirstLoad ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  key={row.id}
                  onClick={() => {
                    if (selectedRowIndex === row.index) {
                      setSelectedRowIndex(null);
                      onSelect?.(null, null);
                    } else {
                      setSelectedRowIndex(row.index);
                      onSelect?.(row.original, row.index);
                    }
                  }}
                  className={[
                    "group text-center backdrop-blur-lg shadow-sm shadow-black/40 rounded-xl transition-all duration-300 cursor-pointer",
                    selectedRowIndex === row.index ? "shadow-md scale-95" : "hover:shadow-lg",
                  ].join(" ")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3 rounded-none">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {enablePagination && (
        <div className="pagination bg-blue-950/60 rounded-3xl rounded-t-none p-2 w-full flex-col mt-4 flex justify-center items-center gap-4">
          <div className="flex flex-nowrap overflow-auto max-w-[100%] items-center gap-2">
            <button
              onClick={() => {
                table.setPageIndex(0);
                setTimeout(() => onPageIndexChange?.(0), 0);
              }}
              disabled={!table.getCanPreviousPage()}
              className="p-2 flex items-center bg-blue-950/20 text-white rounded disabled:opacity-50"
            >
              <i className="fa-solid fa-forward-step"></i>
            </button>
            <button
              onClick={() => {
                table.previousPage();
                setTimeout(() => onPageIndexChange?.(pagination.pageIndex - 1), 0);
              }}
              disabled={!table.getCanPreviousPage()}
              className="p-2 flex items-center bg-blue-950/20 text-white rounded disabled:opacity-50"
            >
              <i className="fa-solid fa-forward"></i>
            </button>

            <div className="flex-nowrap  flex items-center gap-2 mx-2">
              <input
                type="number"
                value={pageInput}
                onChange={handlePageInputChange}
                onBlur={handlePageInputSubmit}
                onKeyDown={(e) => e.key === "Enter" && handlePageInputSubmit()}
                className="p-2 w-30 bg-blue-950/20 text-white rounded text-center"
                min="1"
                max={table.getPageCount()}
              />
              <span className="text-white text-nowrap">از {table.getPageCount()}</span>
            </div>

            <button
              onClick={() => {
                table.nextPage();
                setTimeout(() => onPageIndexChange?.(pagination.pageIndex + 1), 0);
              }}
              disabled={!table.getCanNextPage()}
              className="p-2 flex items-center bg-blue-950/20 text-white rounded disabled:opacity-50"
            >
              <i className="fa-solid fa-backward"></i>
            </button>
            <button
              onClick={() => {
                table.setPageIndex(table.getPageCount() - 1);
                setTimeout(() => onPageIndexChange?.(table.getPageCount() - 1), 0);
              }}
              disabled={!table.getCanNextPage()}
              className="p-2 flex items-center bg-blue-950/20 text-white rounded disabled:opacity-50"
            >
              <i className="fa-solid fa-backward-step"></i>
            </button>
          </div>

          <CustomSelect
            options={pageSizeOptions}
            value={pageSize}
            onChange={(selected) => {
              setPageSize(selected);
              table.setPageSize(selected.value);
              setPagination((prev) => ({
                ...prev,
                pageSize: selected.value,
                pageIndex: pagination.pageIndex,
              }));
              setTimeout(() => onPageIndexChange?.(0), 0);
            }}
            placeholder="تعداد در صفحه"
          />
        </div>
      )}
    </div>
  );
}