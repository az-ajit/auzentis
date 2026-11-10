// Tiny client-side pagination helper. Renders `rows` (already-fetched data,
// not paged server-side — fine at pilot scale) into `tbody` using
// `rowHtml(row)`, with Prev/Next controls in `paginationEl`.
function renderPaginated({ rows, pageSize, tbodyEl, paginationEl, rowHtml, emptyMessage }) {
  let page = 0;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  function render() {
    const start = page * pageSize;
    const slice = rows.slice(start, start + pageSize);
    tbodyEl.innerHTML = slice.length
      ? slice.map(rowHtml).join("")
      : `<tr><td colspan="99" class="muted">${emptyMessage || "Nothing here yet."}</td></tr>`;

    paginationEl.innerHTML = `
      <span>${rows.length === 0 ? 0 : page * pageSize + 1}–${Math.min(rows.length, (page + 1) * pageSize)} of ${rows.length}</span>
      <div class="controls">
        <button class="secondary small" id="pgPrev" ${page === 0 ? "disabled" : ""}>Prev</button>
        <span>Page ${page + 1} of ${totalPages}</span>
        <button class="secondary small" id="pgNext" ${page >= totalPages - 1 ? "disabled" : ""}>Next</button>
      </div>
    `;

    const prevBtn = paginationEl.querySelector("#pgPrev");
    const nextBtn = paginationEl.querySelector("#pgNext");
    if (prevBtn) prevBtn.addEventListener("click", () => { page = Math.max(0, page - 1); render(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { page = Math.min(totalPages - 1, page + 1); render(); });
  }

  render();
  return { refresh: (newRows) => { rows = newRows; page = 0; render(); } };
}
