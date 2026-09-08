"use strict";

/* =========================================================
   TIXIT APP
   Main Application Controller
   ========================================================= */

const TIXIT_APP = {

  pages: {
    home: "index.html",
    search: "search.html",
    library: "library.html",
    add: "add.html",
    viewer: "viewer.html",
    settings: "settings.html"
  },

  initialized: false,

  currentDocument: null,

  state: {
    theme: "system",
    search: "",
    menuOpen: false
  }

};


/* =========================================================
   HELPERS
   ========================================================= */

function $(selector, parent = document) {
  return parent.querySelector(selector);
}


function $$(selector, parent = document) {
  return Array.from(
    parent.querySelectorAll(selector)
  );
}


function escapeTixitHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function formatTixitDate(timestamp) {

  if (!timestamp) {
    return "غير معروف";
  }

  const date =
    new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "غير معروف";
  }

  return date.toLocaleDateString(
    "ar-EG",
    {
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );

}


function formatTixitSize(bytes) {

  const size =
    Number(bytes || 0);

  if (size <= 0) {
    return "0 بايت";
  }

  const units = [
    "بايت",
    "KB",
    "MB",
    "GB"
  ];

  let index = 0;
  let value = size;

  while (
    value >= 1024 &&
    index < units.length - 1
  ) {

    value /= 1024;
    index++;

  }

  return (
    value.toFixed(
      value >= 10 || index === 0
        ? 0
        : 1
    ) +
    " " +
    units[index]
  );

}


function showTixitToast(
  message,
  type = "success"
) {

  let toast =
    document.querySelector(
      ".tixit-toast"
    );


  if (!toast) {

    toast =
      document.createElement(
        "div"
      );

    toast.className =
      "tixit-toast";

    document.body.appendChild(
      toast
    );

  }


  toast.textContent =
    message;


  toast.dataset.type =
    type;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toast._timer
  );


  toast._timer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2600
    );

}


/* =========================================================
   THEME
   ========================================================= */

async function loadTixitTheme() {

  let theme =
    localStorage.getItem(
      "tixit_theme"
    );


  if (!theme) {

    try {

      if (
        typeof getTixitSetting ===
        "function"
      ) {

        theme =
          await getTixitSetting(
            "theme"
          );

      }

    } catch (error) {

      console.warn(
        "Theme load error:",
        error
      );

    }

  }


  if (
    !["system", "light", "dark"]
      .includes(theme)
  ) {

    theme = "system";

  }


  TIXIT_APP.state.theme =
    theme;


  applyTixitTheme(
    theme
  );

}


function applyTixitTheme(theme) {

  const root =
    document.documentElement;


  if (theme === "dark") {

    root.classList.add(
      "tixit-dark"
    );

  } else if (theme === "light") {

    root.classList.remove(
      "tixit-dark"
    );

  } else {

    const dark =
      window.matchMedia &&
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

    root.classList.toggle(
      "tixit-dark",
      dark
    );

  }


  TIXIT_APP.state.theme =
    theme;

}


async function toggleTixitTheme() {

  const current =
    TIXIT_APP.state.theme;


  let next;


  if (current === "light") {

    next = "dark";

  } else if (current === "dark") {

    next = "system";

  } else {

    next = "light";

  }


  applyTixitTheme(
    next
  );


  localStorage.setItem(
    "tixit_theme",
    next
  );


  try {

    if (
      typeof saveTixitSetting ===
      "function"
    ) {

      await saveTixitSetting(
        "theme",
        next
      );

    }

  } catch (error) {

    console.warn(
      "Theme save error:",
      error
    );

  }


  showTixitToast(
    next === "dark"
      ? "تم تفعيل الوضع الداكن"
      : next === "light"
        ? "تم تفعيل الوضع الفاتح"
        : "تم استخدام مظهر الجهاز"
  );

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function openTixitMenu() {

  const sidebar =
    $(".tixit-sidebar");

  const overlay =
    $("[data-tixit-overlay]");


  if (sidebar) {

    sidebar.classList.add(
      "open"
    );

  }


  if (overlay) {

    overlay.classList.add(
      "show"
    );

  }


  TIXIT_APP.state.menuOpen =
    true;

}


function closeTixitMenu() {

  const sidebar =
    $(".tixit-sidebar");

  const overlay =
    $("[data-tixit-overlay]");


  if (sidebar) {

    sidebar.classList.remove(
      "open"
    );

  }


  if (overlay) {

    overlay.classList.remove(
      "show"
    );

  }


  TIXIT_APP.state.menuOpen =
    false;

}


function initTixitMenu() {

  $$("[data-tixit-menu]")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          openTixitMenu
        );

      }
    );


  $$("[data-tixit-overlay]")
    .forEach(
      overlay => {

        overlay.addEventListener(
          "click",
          closeTixitMenu
        );

      }
    );


  $$(".tixit-sidebar a")
    .forEach(
      link => {

        link.addEventListener(
          "click",
          closeTixitMenu
        );

      }
    );

}


/* =========================================================
   GLOBAL SEARCH
   ========================================================= */

function initGlobalSearch() {

  const input =
    $("[data-tixit-global-search]");


  if (!input) {
    return;
  }


  input.value =
    new URLSearchParams(
      location.search
    ).get("q") || "";


  input.addEventListener(
    "keydown",
    event => {

      if (
        event.key !== "Enter"
      ) {

        return;

      }


      const query =
        input.value.trim();


      if (!query) {

        location.href =
          TIXIT_APP.pages.search;

        return;

      }


      location.href =
        TIXIT_APP.pages.search +
        "?q=" +
        encodeURIComponent(
          query
        );

    }
  );


  const clear =
    $("[data-tixit-search-clear]");


  if (clear) {

    clear.addEventListener(
      "click",
      () => {

        input.value = "";

        input.focus();

      }
    );

  }

}


/* =========================================================
   COPY TEXT
   ========================================================= */

async function copyTixitText(
  text
) {

  const value =
    String(
      text || ""
    );


  if (!value) {

    showTixitToast(
      "لا يوجد نص لنسخه",
      "error"
    );

    return false;

  }


  try {

    if (
      navigator.clipboard &&
      window.isSecureContext
    ) {

      await navigator.clipboard.writeText(
        value
      );

    } else {

      const textarea =
        document.createElement(
          "textarea"
        );

      textarea.value =
        value;

      textarea.style.position =
        "fixed";

      textarea.style.opacity =
        "0";

      document.body.appendChild(
        textarea
      );

      textarea.focus();
      textarea.select();

      document.execCommand(
        "copy"
      );

      textarea.remove();

    }


    showTixitToast(
      "تم نسخ النص"
    );

    return true;

  } catch (error) {

    console.error(
      error
    );

    showTixitToast(
      "تعذر نسخ النص",
      "error"
    );

    return false;

  }

}


/* =========================================================
   COPY BUTTON
   ========================================================= */

function initCopyButtons() {

  $$("[data-tixit-copy]")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          async () => {

            let text =
              button.dataset.text ||
              "";


            if (!text) {

              const target =
                button.dataset.target;


              if (target) {

                const element =
                  document.querySelector(
                    target
                  );

                if (element) {

                  text =
                    element.innerText ||
                    element.textContent ||
                    "";

                }

              }

            }


            if (!text) {

              const reader =
                $(".tixit-reader");

              if (reader) {

                text =
                  reader.innerText ||
                  reader.textContent ||
                  "";

              }

            }


            await copyTixitText(
              text
            );

          }
        );

      }
    );

}


/* =========================================================
   BACK BUTTON
   ========================================================= */

function initBackButtons() {

  $$("[data-tixit-back]")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            if (
              history.length > 1
            ) {

              history.back();

            } else {

              location.href =
                TIXIT_APP.pages.home;

            }

          }
        );

      }
    );

}


/* =========================================================
   FAVORITE
   ========================================================= */

async function handleTixitFavorite(
  button
) {

  const id =
    button.dataset.id ||
    new URLSearchParams(
      location.search
    ).get("id");


  if (!id) {
    return;
  }


  try {

    const document =
      await toggleTixitFavorite(
        id
      );


    if (!document) {

      showTixitToast(
        "العنصر غير موجود",
        "error"
      );

      return;

    }


    updateFavoriteButtons(
      id,
      document.favorite
    );


    showTixitToast(
      document.favorite
        ? "تمت الإضافة إلى المفضلة"
        : "تمت الإزالة من المفضلة"
    );


    await refreshTixitStats();

  } catch (error) {

    console.error(
      error
    );

    showTixitToast(
      "تعذر تحديث المفضلة",
      "error"
    );

  }

}


function updateFavoriteButtons(
  id,
  active
) {

  $$(
    `[data-tixit-favorite][data-id="${CSS.escape(id)}"]`
  )
  .forEach(
    button => {

      button.classList.toggle(
        "active",
        active
      );


      button.setAttribute(
        "aria-pressed",
        String(active)
      );


      if (
        button.querySelector(
          ".tixit-favorite-icon"
        )
      ) {

        button.querySelector(
          ".tixit-favorite-icon"
        ).textContent =
          active
            ? "★"
            : "☆";

      }

    }
  );

}


function initFavoriteButtons() {

  $$("[data-tixit-favorite]")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () =>
            handleTixitFavorite(
              button
            )
        );

      }
    );

}


/* =========================================================
   PIN
   ========================================================= */

async function handleTixitPin(
  button
) {

  const id =
    button.dataset.id ||
    new URLSearchParams(
      location.search
    ).get("id");


  if (!id) {
    return;
  }


  try {

    const document =
      await toggleTixitPin(
        id
      );


    if (!document) {

      showTixitToast(
        "العنصر غير موجود",
        "error"
      );

      return;

    }


    updatePinButtons(
      id,
      document.pinned
    );


    showTixitToast(
      document.pinned
        ? "تم تثبيت العنصر"
        : "تم إلغاء التثبيت"
    );


    await refreshTixitStats();

  } catch (error) {

    console.error(
      error
    );

    showTixitToast(
      "تعذر تحديث التثبيت",
      "error"
    );

  }

}


function updatePinButtons(
  id,
  active
) {

  $$(
    `[data-tixit-pin][data-id="${CSS.escape(id)}"]`
  )
  .forEach(
    button => {

      button.classList.toggle(
        "active",
        active
      );


      button.setAttribute(
        "aria-pressed",
        String(active)
      );

    }
  );

}


function initPinButtons() {

  $$("[data-tixit-pin]")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () =>
            handleTixitPin(
              button
            )
        );

      }
    );

}


/* =========================================================
   DELETE
   ========================================================= */

async function handleTixitDelete(
  button
) {

  const id =
    button.dataset.id ||
    new URLSearchParams(
      location.search
    ).get("id");


  if (!id) {
    return;
  }


  const confirmed =
    confirm(
      "هل أنت متأكد من حذف هذا العنصر؟\nلا يمكن التراجع عن هذه العملية."
    );


  if (!confirmed) {
    return;
  }


  try {

    await deleteTixitDocument(
      id
    );


    showTixitToast(
      "تم حذف العنصر"
    );


    setTimeout(
      () => {

        location.href =
          TIXIT_APP.pages.library;

      },
      500
    );


  } catch (error) {

    console.error(
      error
    );

    showTixitToast(
      "تعذر حذف العنصر",
      "error"
    );

  }

}


function initDeleteButtons() {

  $$("[data-tixit-delete]")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () =>
            handleTixitDelete(
              button
            )
        );

      }
    );

}


/* =========================================================
   STATISTICS
   ========================================================= */

async function refreshTixitStats() {

  if (
    typeof getTixitStatistics !==
    "function"
  ) {

    return;

  }


  try {

    const stats =
      await getTixitStatistics();


    $$(
      "[data-tixit-stat]"
    )
    .forEach(
      element => {

        const key =
          element.dataset.tixitStat;


        if (
          Object.prototype.hasOwnProperty.call(
            stats,
            key
          )
        ) {

          element.textContent =
            Number(
              stats[key] || 0
            ).toLocaleString(
              "ar-EG"
            );

        }

      }
    );

  } catch (error) {

    console.warn(
      "Stats error:",
      error
    );

  }

}


/* =========================================================
   BACKUP
   ========================================================= */

async function handleTixitBackup() {

  try {

    if (
      typeof downloadTixitBackup ===
      "function"
    ) {

      await downloadTixitBackup();

    } else if (
      typeof exportTixitDatabase ===
      "function"
    ) {

      const data =
        await exportTixitDatabase();


      const blob =
        new Blob(
          [
            JSON.stringify(
              data,
              null,
              2
            )
          ],
          {
            type:
              "application/json"
          }
        );


      const url =
        URL.createObjectURL(
          blob
        );


      const link =
        document.createElement(
          "a"
        );


      link.href =
        url;

      link.download =
        "TIXIT-backup.json";

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      URL.revokeObjectURL(
        url
      );

    }


    showTixitToast(
      "تم إنشاء النسخة الاحتياطية"
    );

  } catch (error) {

    console.error(
      error
    );

    showTixitToast(
      "تعذر إنشاء النسخة الاحتياطية",
      "error"
    );

  }

}


function initBackupButtons() {

  $$("[data-tixit-backup]")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          handleTixitBackup
        );

      }
    );

}


/* =========================================================
   RESTORE
   ========================================================= */

function initRestoreButtons() {

  const buttons =
    $$("[data-tixit-restore]");


  const input =
    $("#tixitRestoreInput");


  if (!input) {
    return;
  }


  buttons.forEach(
    button => {

      button.addEventListener(
        "click",
        () =>
          input.click()
      );

    }
  );


  input.addEventListener(
    "change",
    async event => {

      const file =
        event.target.files?.[0];


      if (!file) {
        return;
      }


      const confirmed =
        confirm(
          "استعادة النسخة الاحتياطية قد تضيف بيانات إلى بياناتك الحالية. هل تريد المتابعة؟"
        );


      if (!confirmed) {

        input.value = "";
        return;

      }


      try {

        const text =
          await file.text();


        const data =
          JSON.parse(
            text
          );


        if (
          typeof importTixitDatabase !==
          "function"
        ) {

          throw new Error(
            "Import function unavailable"
          );

        }


        await importTixitDatabase(
          data
        );


        showTixitToast(
          "تمت استعادة البيانات بنجاح"
        );


        setTimeout(
          () =>
            location.reload(),
          700
        );


      } catch (error) {

        console.error(
          error
        );

        showTixitToast(
          "ملف النسخة الاحتياطية غير صالح",
          "error"
        );

      }


      input.value = "";

    }
  );

}


/* =========================================================
   WIPE DATABASE
   ========================================================= */

function initWipeButton() {

  $$("[data-tixit-wipe]")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          async () => {

            const firstConfirm =
              confirm(
                "سيتم حذف جميع معلومات TIXIT. هل أنت متأكد؟"
              );


            if (!firstConfirm) {
              return;
            }


            const secondConfirm =
              confirm(
                "تأكيد أخير: حذف جميع البيانات نهائيًا؟"
              );


            if (!secondConfirm) {
              return;
            }


            try {

              await tixitClear();


              showTixitToast(
                "تم حذف جميع البيانات"
              );


              setTimeout(
                () => {

                  location.href =
                    TIXIT_APP.pages.home;

                },
                700
              );


            } catch (error) {

              console.error(
                error
              );

              showTixitToast(
                "تعذر حذف البيانات",
                "error"
              );

            }

          }
        );

      }
    );

}


/* =========================================================
   DOCUMENT CARD
   ========================================================= */

function createTixitDocumentCard(
  document
) {

  const article =
    window.document.createElement(
      "article"
    );


  article.className =
    "tixit-document-card";


  article.dataset.id =
    document.id;


  const typeLabel =
    document.type === "pdf"
      ? "PDF"
      : document.type === "file"
        ? "ملف"
        : "نص";


  const preview =
    String(
      document.description ||
      document.content ||
      document.text ||
      ""
    )
    .replace(/\s+/g, " ")
    .trim()
    .slice(
      0,
      180
    );


  article.innerHTML = `

    <div class="tixit-document-card-top">

      <div class="tixit-document-type">
        ${escapeTixitHTML(typeLabel)}
      </div>

      <div class="tixit-document-actions">

        <button
          type="button"
          class="tixit-icon-button
                 ${document.favorite ? "active" : ""}"
          data-tixit-favorite
          data-id="${escapeTixitHTML(document.id)}"
          aria-label="المفضلة">

          <span class="tixit-favorite-icon">
            ${document.favorite ? "★" : "☆"}
          </span>

        </button>

        <button
          type="button"
          class="tixit-icon-button
                 ${document.pinned ? "active" : ""}"
          data-tixit-pin
          data-id="${escapeTixitHTML(document.id)}"
          aria-label="تثبيت">

          ⌖

        </button>

      </div>

    </div>


    <a
      class="tixit-document-card-body"
      href="viewer.html?id=${encodeURIComponent(document.id)}">

      <h3>
        ${escapeTixitHTML(document.title)}
      </h3>

      ${
        preview
          ? `<p>${escapeTixitHTML(preview)}</p>`
          : `<p>لا توجد معاينة متاحة.</p>`
      }

    </a>


    <div class="tixit-document-card-footer">

      <span>
        ${escapeTixitHTML(document.category || "عام")}
      </span>

      <span>
        ${escapeTixitHTML(
          formatTixitDate(
            document.updatedAt ||
            document.createdAt
          )
        )}
      </span>

    </div>

  `;


  article
    .querySelector(
      "[data-tixit-favorite]"
    )
    .addEventListener(
      "click",
      event => {

        event.preventDefault();

        event.stopPropagation();

        handleTixitFavorite(
          event.currentTarget
        );

      }
    );


  article
    .querySelector(
      "[data-tixit-pin]"
    )
    .addEventListener(
      "click",
      event => {

        event.preventDefault();

        event.stopPropagation();

        handleTixitPin(
          event.currentTarget
        );

      }
    );


  return article;

}


/* =========================================================
   LOAD RECENT DOCUMENTS
   ========================================================= */

async function loadTixitRecentDocuments() {

  const container =
    $("[data-tixit-recent]");


  if (!container) {
    return;
  }


  try {

    const documents =
      await getTixitDocuments();


    const recent =
      documents.slice(
        0,
        6
      );


    container.innerHTML = "";


    if (!recent.length) {

      container.innerHTML = `

        <div class="tixit-empty-state">

          <div class="tixit-empty-icon">
            ▤
          </div>

          <h3>
            لا توجد معلومات بعد
          </h3>

          <p>
            ابدأ بإضافة أول معلومة إلى مساحة TIXIT.
          </p>

          <a
            href="add.html"
            class="tixit-button tixit-button-primary">

            + إضافة معلومات

          </a>

        </div>

      `;

      return;

    }


    recent.forEach(
      document => {

        container.appendChild(
          createTixitDocumentCard(
            document
          )
        );

      }
    );

  } catch (error) {

    console.error(
      error
    );

  }

}


/* =========================================================
   SEARCH PAGE
   ========================================================= */

async function initSearchPage() {

  const form =
    $("#searchForm");


  const input =
    $("#searchInput");


  const results =
    $("#searchResults");


  if (
    !form ||
    !input ||
    !results
  ) {

    return;

  }


  const params =
    new URLSearchParams(
      location.search
    );


  const initialQuery =
    params.get("q") ||
    "";


  input.value =
    initialQuery;


  async function performSearch() {

    const query =
      input.value.trim();


    results.innerHTML = `

      <div class="tixit-loading">
        جارٍ البحث...
      </div>

    `;


    try {

      const type =
        $("#searchType")?.value ||
        "all";


      const favorites =
        $("#favoritesOnly")?.checked ||
        false;


      const pinned =
        $("#pinnedOnly")?.checked ||
        false;


      const found =
        await searchTixitDocuments(
          query,
          {
            type,
            favoritesOnly:
              favorites,
            pinnedOnly:
              pinned
          }
        );


      if (query) {

        await saveTixitSearch(
          query
        );

      }


      renderTixitSearchResults(
        results,
        found,
        query
      );


      await refreshTixitStats();

    } catch (error) {

      console.error(
        error
      );


      results.innerHTML = `

        <div class="tixit-empty-state">

          <h3>
            حدث خطأ أثناء البحث
          </h3>

          <p>
            حاول مرة أخرى.
          </p>

        </div>

      `;

    }

  }


  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      performSearch();

    }
  );


  $$("#searchType, #favoritesOnly, #pinnedOnly")
    .forEach(
      element => {

        element.addEventListener(
          "change",
          performSearch
        );

      }
    );


  if (initialQuery) {

    performSearch();

  } else {

    renderTixitSearchResults(
      results,
      [],
      ""
    );

  }

}


function renderTixitSearchResults(
  container,
  documents,
  query
) {

  if (!documents.length) {

    container.innerHTML = `

      <div class="tixit-empty-state">

        <div class="tixit-empty-icon">
          ⌕
        </div>

        <h3>
          ${
            query
              ? "لم يتم العثور على نتائج"
              : "ابدأ البحث"
          }
        </h3>

        <p>
          ${
            query
              ? "جرّب كلمة أخرى أو غيّر الفلاتر."
              : "اكتب كلمة أو عبارة للبحث داخل معلوماتك."
          }
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML = `

    <div class="tixit-results-header">

      <strong>
        ${documents.length.toLocaleString("ar-EG")}
        نتيجة
      </strong>

    </div>

  `;


  const fragment =
    document.createDocumentFragment();


  documents.forEach(
    item => {

      const card =
        createTixitDocumentCard(
          item
        );


      fragment.appendChild(
        card
      );

    }
  );


  container.appendChild(
    fragment
  );

}


/* =========================================================
   LIBRARY PAGE
   ========================================================= */

async function initLibraryPage() {

  const container =
    $("#libraryList") ||
    $("[data-tixit-library]");


  if (!container) {
    return;
  }


  const search =
    $("#librarySearch");


  const filter =
    $("#libraryFilter");


  const sort =
    $("#librarySort");


  async function render() {

    let documents =
      await getTixitDocuments();


    const query =
      search?.value
        ?.trim()
        .toLowerCase() ||
      "";


    const filterValue =
      filter?.value ||
      "all";


    if (query) {

      documents =
        documents.filter(
          item => {

            const text = [

              item.title,
              item.description,
              item.content,
              item.text,
              item.category,
              ...(item.tags || []),
              item.fileName

            ]
            .join(" ")
            .toLowerCase();


            return text.includes(
              query
            );

          }
        );

    }


    if (
      filterValue ===
      "favorites"
    ) {

      documents =
        documents.filter(
          item =>
            item.favorite
        );

    }


    if (
      filterValue ===
      "pinned"
    ) {

      documents =
        documents.filter(
          item =>
            item.pinned
        );

    }


    if (
      filterValue ===
      "pdf"
    ) {

      documents =
        documents.filter(
          item =>
            item.type === "pdf" ||
            item.mimeType ===
              "application/pdf"
        );

    }


    if (
      filterValue ===
      "text"
    ) {

      documents =
        documents.filter(
          item =>
            item.type === "text"
        );

    }


    const sortValue =
      sort?.value ||
      "updated";


    documents.sort(
      (a, b) => {

        if (
          sortValue ===
          "title"
        ) {

          return String(
            a.title
          ).localeCompare(
            String(
              b.title
            ),
            "ar"
          );

        }


        if (
          sortValue ===
          "oldest"
        ) {

          return (
            Number(
              a.updatedAt || 0
            ) -
            Number(
              b.updatedAt || 0
            )
          );

        }


        return (
          Number(
            b.updatedAt || 0
          ) -
          Number(
            a.updatedAt || 0
          )
        );

      }
    );


    container.innerHTML = "";


    if (!documents.length) {

      container.innerHTML = `

        <div class="tixit-empty-state">

          <div class="tixit-empty-icon">
            ▤
          </div>

          <h3>
            لا توجد عناصر
          </h3>

          <p>
            لم نجد معلومات مطابقة للفلتر الحالي.
          </p>

        </div>

      `;

      return;

    }


    const fragment =
      document.createDocumentFragment();


    documents.forEach(
      item => {

        fragment.appendChild(
          createTixitDocumentCard(
            item
          )
        );

      }
    );


    container.appendChild(
      fragment
    );

  }


  [search, filter, sort]
    .filter(Boolean)
    .forEach(
      element => {

        element.addEventListener(
          element === search
            ? "input"
            : "change",
          render
        );

      }
    );


  const urlFilter =
    new URLSearchParams(
      location.search
    ).get("filter");


  if (
    urlFilter &&
    filter
  ) {

    filter.value =
      urlFilter;

  }


  await render();

}


/* =========================================================
   VIEWER PAGE
   ========================================================= */

async function initViewerPage() {

  const id =
    new URLSearchParams(
      location.search
    ).get("id");


  if (!id) {
    return;
  }


  const documentData =
    await getTixitDocument(
      id
    );


  if (!documentData) {

    const title =
      $("#viewerTitle");


    if (title) {

      title.textContent =
        "العنصر غير موجود";

    }

    return;

  }


  TIXIT_APP.currentDocument =
    documentData;


  const title =
    $("#viewerTitle");


  const description =
    $("#viewerDescription");


  const category =
    $("#viewerCategory");


  const date =
    $("#viewerDate");


  const content =
    $("#viewerContent") ||
    $(".tixit-reader");


  const tags =
    $("#viewerTags");


  const favorite =
    $("[data-tixit-favorite]");


  const pin =
    $("[data-tixit-pin]");


  const deleteButton =
    $("[data-tixit-delete]");


  if (title) {

    title.textContent =
      documentData.title;

  }


  if (description) {

    description.textContent =
      documentData.description ||
      "";

  }


  if (category) {

    category.textContent =
      documentData.category ||
      "عام";

  }


  if (date) {

    date.textContent =
      formatTixitDate(
        documentData.updatedAt ||
        documentData.createdAt
      );

  }


  if (content) {

    content.textContent =
      documentData.content ||
      documentData.text ||
      "";

  }


  if (tags) {

    tags.innerHTML = "";

    (
      documentData.tags ||
      []
    )
    .forEach(
      tag => {

        const span =
          document.createElement(
            "span"
          );

        span.className =
          "tixit-tag";

        span.textContent =
          tag;

        tags.appendChild(
          span
        );

      }
    );

  }


  if (favorite) {

    favorite.dataset.id =
      id;

    updateFavoriteButtons(
      id,
      documentData.favorite
    );

  }


  if (pin) {

    pin.dataset.id =
      id;

    updatePinButtons(
      id,
      documentData.pinned
    );

  }


  if (deleteButton) {

    deleteButton.dataset.id =
      id;

  }


  const filePreview =
    $("#viewerFilePreview");


  if (
    filePreview &&
    documentData.fileData
  ) {

    renderTixitFilePreview(
      filePreview,
      documentData
    );

  }

}


function renderTixitFilePreview(
  container,
  documentData
) {

  const mime =
    documentData.mimeType ||
    documentData.fileType ||
    "";


  if (
    mime ===
    "application/pdf" ||
    documentData.type === "pdf"
  ) {

    container.innerHTML = `

      <iframe
        class="tixit-file-frame"
        title="معاينة PDF">
      </iframe>

    `;


    const frame =
      container.querySelector(
        "iframe"
      );


    try {

      const blob =
        dataURLToBlob(
          documentData.fileData,
          mime
        );


      frame.src =
        URL.createObjectURL(
          blob
        );

    } catch (error) {

      frame.remove();

      container.textContent =
        "تعذر عرض الملف.";

    }


    return;

  }


  if (
    mime.startsWith(
      "image/"
    )
  ) {

    const image =
      document.createElement(
        "img"
      );


    image.className =
      "tixit-file-image";


    image.alt =
      documentData.fileName ||
      "صورة";


    image.src =
      documentData.fileData;


    container.innerHTML = "";

    container.appendChild(
      image
    );

    return;

  }


  container.innerHTML = `

    <div class="tixit-file-info">

      <strong>
        ${escapeTixitHTML(
          documentData.fileName ||
          "ملف"
        )}
      </strong>

      <span>
        ${formatTixitSize(
          documentData.fileSize
        )}
      </span>

    </div>

  `;

}


function dataURLToBlob(
  dataURL,
  mime
) {

  if (
    typeof dataURL !==
    "string"
  ) {

    throw new Error(
      "Invalid file data"
    );

  }


  if (
    dataURL.startsWith(
      "data:"
    )
  ) {

    const parts =
      dataURL.split(",");


    const base64 =
      parts[1];


    const binary =
      atob(base64);


    const bytes =
      new Uint8Array(
        binary.length
      );


    for (
      let i = 0;
      i < binary.length;
      i++
    ) {

      bytes[i] =
        binary.charCodeAt(i);

    }


    return new Blob(
      [bytes],
      {
        type:
          mime ||
          "application/octet-stream"
      }
    );

  }


  throw new Error(
    "Unsupported file format"
  );

}


/* =========================================================
   ADD PAGE
   ========================================================= */

async function initAddPage() {

  const form =
    $("#addForm");


  if (!form) {
    return;
  }


  const type =
    $("#documentType");


  const fileInput =
    $("#fileInput");


  const textArea =
    $("#documentContent");


  const fileInfo =
    $("#fileInfo");


  const dropzone =
    $("#dropzone");


  function updateTypeUI() {

    const selected =
      type?.value ||
      "text";


    $$(".tixit-type-panel")
      .forEach(
        panel => {

          panel.hidden =
            panel.dataset.type !==
            selected;

        }
      );


    if (textArea) {

      textArea.disabled =
        selected !== "text";

    }


    if (fileInput) {

      fileInput.disabled =
        selected === "text";

    }

  }


  if (type) {

    type.addEventListener(
      "change",
      updateTypeUI
    );

    updateTypeUI();

  }


  if (
    fileInput &&
    fileInfo
  ) {

    fileInput.addEventListener(
      "change",
      () => {

        const file =
          fileInput.files?.[0];


        if (!file) {

          fileInfo.textContent =
            "";

          return;

        }


        fileInfo.textContent =
          file.name +
          " — " +
          formatTixitSize(
            file.size
          );

      }
    );

  }


  if (dropzone && fileInput) {

    [
      "dragenter",
      "dragover"
    ]
    .forEach(
      eventName => {

        dropzone.addEventListener(
          eventName,
          event => {

            event.preventDefault();

            dropzone.classList.add(
              "dragover"
            );

          }
        );

      }
    );


    [
      "dragleave",
      "drop"
    ]
    .forEach(
      eventName => {

        dropzone.addEventListener(
          eventName,
          event => {

            event.preventDefault();

            dropzone.classList.remove(
              "dragover"
            );

          }
        );

      }
    );


    dropzone.addEventListener(
      "drop",
      event => {

        const files =
          event.dataTransfer.files;


        if (files.length) {

          fileInput.files =
            files;


          fileInput.dispatchEvent(
            new Event(
              "change"
            )
          );

        }

      }
    );

  }


  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const submit =
        form.querySelector(
          '[type="submit"]'
        );


      if (submit) {

        submit.disabled =
          true;

      }


      try {

        const selectedType =
          type?.value ||
          "text";


        const title =
          $("#documentTitle")
            ?.value
            .trim() ||
          "بدون عنوان";


        const category =
          $("#documentCategory")
            ?.value
            .trim() ||
          "عام";


        const description =
          $("#documentDescription")
            ?.value
            .trim() ||
          "";


        const tags =
          $("#documentTags")
            ?.value
            .split(",")
            .map(
              tag =>
                tag.trim()
            )
            .filter(Boolean) ||
          [];


        const favorite =
          $("#documentFavorite")
            ?.checked ||
          false;


        const pinned =
          $("#documentPinned")
            ?.checked ||
          false;


        let content =
          textArea?.value ||
          "";


        let fileData =
          null;


        let fileName =
          "";


        let fileSize =
          0;


        let mimeType =
          "";


        if (
          selectedType !== "text"
        ) {

          const file =
            fileInput?.files?.[0];


          if (!file) {

            throw new Error(
              "يرجى اختيار ملف"
            );

          }


          fileName =
            file.name;


          fileSize =
            file.size;


          mimeType =
            file.type ||
            "application/octet-stream";


          fileData =
            await readTixitFile(
              file
            );

        }


        const documentData = {

          title,

          type:
            selectedType,

          category,

          description,

          content,

          text:
            content,

          tags,

          favorite,

          pinned,

          fileName,

          fileSize,

          fileData,

          mimeType

        };


        await saveTixitDocument(
          documentData
        );


        showTixitToast(
          "تم حفظ المعلومات بنجاح"
        );


        form.reset();


        if (type) {

          type.value =
            "text";

          updateTypeUI();

        }


        setTimeout(
          () => {

            location.href =
              TIXIT_APP.pages.library;

          },
          700
        );


      } catch (error) {

        console.error(
          error
        );


        showTixitToast(
          error.message ||
          "تعذر حفظ المعلومات",
          "error"
        );


        if (submit) {

          submit.disabled =
            false;

        }

      }

    }
  );

}


function readTixitFile(
  file
) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();


      reader.onload =
        () =>
          resolve(
            reader.result
          );


      reader.onerror =
        () =>
          reject(
            reader.error
          );


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* =========================================================
   SETTINGS PAGE
   ========================================================= */

function initSettingsPage() {

  const select =
    $("#themeSelect");


  if (!select) {
    return;
  }


  select.value =
    TIXIT_APP.state.theme;


  select.addEventListener(
    "change",
    async () => {

      const value =
        select.value;


      applyTixitTheme(
        value
      );


      localStorage.setItem(
        "tixit_theme",
        value
      );


      try {

        await saveTixitSetting(
          "theme",
          value
        );

      } catch (error) {

        console.warn(
          error
        );

      }


      showTixitToast(
        "تم حفظ إعدادات المظهر"
      );

    }
  );

}


/* =========================================================
   HOME QUICK ACTIONS
   ========================================================= */

function initHomeActions() {

  $$("[data-tixit-home]")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            location.href =
              TIXIT_APP.pages.home;

          }
        );

      }
    );

}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

function initTixitShortcuts() {

  document.addEventListener(
    "keydown",
    event => {

      const target =
        event.target;


      const typing =
        target &&
        (
          target.tagName ===
            "INPUT" ||
          target.tagName ===
            "TEXTAREA" ||
          target.isContentEditable
        );


      if (
        event.key === "/" &&
        !typing
      ) {

        event.preventDefault();


        const search =
          $(
            "[data-tixit-global-search]"
          );


        if (search) {

          search.focus();

        }

      }


      if (
        event.key === "Escape" &&
        TIXIT_APP.state.menuOpen
      ) {

        closeTixitMenu();

      }

    }
  );

}


/* =========================================================
   DATABASE SAFETY
   ========================================================= */

async function ensureTixitDatabase() {

  if (
    typeof initializeTixitDatabase !==
    "function"
  ) {

    console.error(
      "TIXIT database.js is missing."
    );

    showTixitToast(
      "قاعدة البيانات غير متاحة",
      "error"
    );

    return false;

  }


  try {

    await initializeTixitDatabase();

    return true;

  } catch (error) {

    console.error(
      "Database initialization error:",
      error
    );


    showTixitToast(
      "تعذر تشغيل قاعدة البيانات",
      "error"
    );


    return false;

  }

}


/* =========================================================
   SYSTEM THEME LISTENER
   ========================================================= */

function initSystemThemeListener() {

  if (!window.matchMedia) {
    return;
  }


  const media =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    );


  const handler =
    () => {

      if (
        TIXIT_APP.state.theme ===
        "system"
      ) {

        applyTixitTheme(
          "system"
        );

      }

    };


  if (
    typeof media.addEventListener ===
    "function"
  ) {

    media.addEventListener(
      "change",
      handler
    );

  } else if (
    typeof media.addListener ===
    "function"
  ) {

    media.addListener(
      handler
    );

  }

}


/* =========================================================
   GLOBAL INIT
   ========================================================= */

async function initTixitApp() {

  if (
    TIXIT_APP.initialized
  ) {

    return;

  }


  TIXIT_APP.initialized =
    true;


  await ensureTixitDatabase();


  await loadTixitTheme();


  initTixitMenu();

  initGlobalSearch();

  initCopyButtons();

  initBackButtons();

  initFavoriteButtons();

  initPinButtons();

  initDeleteButtons();

  initBackupButtons();

  initRestoreButtons();

  initWipeButton();

  initHomeActions();

  initTixitShortcuts();

  initSystemThemeListener();


  await refreshTixitStats();


  await loadTixitRecentDocuments();


  await initSearchPage();

  await initLibraryPage();

  await initViewerPage();

  await initAddPage();

  initSettingsPage();

}


/* =========================================================
   START
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initTixitApp,
    {
      once: true
    }
  );

} else {

  initTixitApp();

}