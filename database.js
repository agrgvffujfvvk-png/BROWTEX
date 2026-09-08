"use strict";

/* =========================================================
   TIXIT DATABASE ENGINE
   Local IndexedDB Storage
   ========================================================= */

const TIXIT_DB = {

  name: "TIXIT_DATABASE",
  version: 1,

  db: null,

  stores: {
    documents: "documents",
    searches: "searches",
    settings: "settings"
  }

};


/* =========================================================
   OPEN DATABASE
   ========================================================= */

function initializeTixitDatabase() {

  return new Promise((resolve, reject) => {

    if (TIXIT_DB.db) {
      resolve(TIXIT_DB.db);
      return;
    }

    const request = indexedDB.open(
      TIXIT_DB.name,
      TIXIT_DB.version
    );


    request.onupgradeneeded = function (event) {

      const db = event.target.result;


      /* DOCUMENTS */

      if (!db.objectStoreNames.contains("documents")) {

        const documents =
          db.createObjectStore(
            "documents",
            {
              keyPath: "id"
            }
          );


        documents.createIndex(
          "title",
          "title",
          { unique: false }
        );


        documents.createIndex(
          "type",
          "type",
          { unique: false }
        );


        documents.createIndex(
          "category",
          "category",
          { unique: false }
        );


        documents.createIndex(
          "favorite",
          "favorite",
          { unique: false }
        );


        documents.createIndex(
          "pinned",
          "pinned",
          { unique: false }
        );


        documents.createIndex(
          "createdAt",
          "createdAt",
          { unique: false }
        );


        documents.createIndex(
          "updatedAt",
          "updatedAt",
          { unique: false }
        );

      }


      /* SEARCH HISTORY */

      if (!db.objectStoreNames.contains("searches")) {

        const searches =
          db.createObjectStore(
            "searches",
            {
              keyPath: "id",
              autoIncrement: true
            }
          );


        searches.createIndex(
          "query",
          "query",
          { unique: false }
        );


        searches.createIndex(
          "createdAt",
          "createdAt",
          { unique: false }
        );

      }


      /* SETTINGS */

      if (!db.objectStoreNames.contains("settings")) {

        db.createObjectStore(
          "settings",
          {
            keyPath: "key"
          }
        );

      }

    };


    request.onsuccess = function (event) {

      TIXIT_DB.db =
        event.target.result;

      resolve(
        TIXIT_DB.db
      );

    };


    request.onerror = function () {

      reject(
        request.error
      );

    };

  });

}


/* =========================================================
   DATABASE READY
   ========================================================= */

async function tixitDBReady() {

  if (!TIXIT_DB.db) {
    await initializeTixitDatabase();
  }

  return TIXIT_DB.db;

}


/* =========================================================
   GENERATE ID
   ========================================================= */

function generateTixitId() {

  return (
    "tixit_" +
    Date.now().toString(36) +
    "_" +
    Math.random()
      .toString(36)
      .substring(2, 10)
  );

}


/* =========================================================
   NORMALIZE DOCUMENT
   ========================================================= */

function normalizeTixitDocument(data) {

  const now =
    Date.now();


  const document = {

    id:
      data.id ||
      generateTixitId(),

    title:
      String(
        data.title ||
        "بدون عنوان"
      ).trim(),

    type:
      data.type ||
      "text",

    category:
      String(
        data.category ||
        "عام"
      ).trim(),

    description:
      String(
        data.description ||
        ""
      ).trim(),

    content:
      String(
        data.content ||
        ""
      ),

    text:
      String(
        data.text ||
        data.content ||
        ""
      ),

    tags:
      Array.isArray(data.tags)
        ? data.tags
        : String(
            data.tags || ""
          )
          .split(",")
          .map(tag =>
            tag.trim()
          )
          .filter(Boolean),

    favorite:
      Boolean(
        data.favorite
      ),

    pinned:
      Boolean(
        data.pinned
      ),

    fileName:
      data.fileName ||
      "",

    fileType:
      data.fileType ||
      "",

    fileSize:
      Number(
        data.fileSize ||
        0
      ),

    fileData:
      data.fileData ||
      null,

    mimeType:
      data.mimeType ||
      "",

    createdAt:
      data.createdAt ||
      now,

    updatedAt:
      now

  };


  return document;

}


/* =========================================================
   ADD DOCUMENT
   ========================================================= */

async function addTixitDocument(data) {

  const db =
    await tixitDBReady();


  const document =
    normalizeTixitDocument(data);


  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(
          ["documents"],
          "readwrite"
        );


      const store =
        transaction.objectStore(
          "documents"
        );


      const request =
        store.add(
          document
        );


      request.onsuccess =
        function () {

          resolve(
            document
          );

        };


      request.onerror =
        function () {

          reject(
            request.error
          );

        };

    }
  );

}


/* =========================================================
   SAVE DOCUMENT
   ========================================================= */

async function saveTixitDocument(data) {

  const db =
    await tixitDBReady();


  const document =
    normalizeTixitDocument(data);


  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(
          ["documents"],
          "readwrite"
        );


      const store =
        transaction.objectStore(
          "documents"
        );


      const request =
        store.put(
          document
        );


      request.onsuccess =
        function () {

          resolve(
            document
          );

        };


      request.onerror =
        function () {

          reject(
            request.error
          );

        };

    }
  );

}


/* =========================================================
   GET ONE DOCUMENT
   ========================================================= */

async function getTixitDocument(id) {

  const db =
    await tixitDBReady();


  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(
          ["documents"],
          "readonly"
        );


      const store =
        transaction.objectStore(
          "documents"
        );


      const request =
        store.get(id);


      request.onsuccess =
        function () {

          resolve(
            request.result ||
            null
          );

        };


      request.onerror =
        function () {

          reject(
            request.error
          );

        };

    }
  );

}


const getTixitDocumentById =
  getTixitDocument;


/* =========================================================
   GET ALL DOCUMENTS
   ========================================================= */

async function getTixitDocuments() {

  const db =
    await tixitDBReady();


  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(
          ["documents"],
          "readonly"
        );


      const store =
        transaction.objectStore(
          "documents"
        );


      const request =
        store.getAll();


      request.onsuccess =
        function () {

          const documents =
            request.result || [];


          documents.sort(
            (a, b) =>
              Number(
                b.updatedAt || 0
              ) -
              Number(
                a.updatedAt || 0
              )
          );


          resolve(
            documents
          );

        };


      request.onerror =
        function () {

          reject(
            request.error
          );

        };

    }
  );

}


const getAllTixitDocuments =
  getTixitDocuments;


/* =========================================================
   DELETE DOCUMENT
   ========================================================= */

async function deleteTixitDocument(id) {

  const db =
    await tixitDBReady();


  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(
          ["documents"],
          "readwrite"
        );


      const store =
        transaction.objectStore(
          "documents"
        );


      const request =
        store.delete(id);


      request.onsuccess =
        function () {

          resolve(true);

        };


      request.onerror =
        function () {

          reject(
            request.error
          );

        };

    }
  );

}


/* =========================================================
   UPDATE FAVORITE
   ========================================================= */

async function toggleTixitFavorite(id) {

  const document =
    await getTixitDocument(id);


  if (!document) {
    return null;
  }


  document.favorite =
    !document.favorite;


  document.updatedAt =
    Date.now();


  return saveTixitDocument(
    document
  );

}


/* =========================================================
   UPDATE PIN
   ========================================================= */

async function toggleTixitPin(id) {

  const document =
    await getTixitDocument(id);


  if (!document) {
    return null;
  }


  document.pinned =
    !document.pinned;


  document.updatedAt =
    Date.now();


  return saveTixitDocument(
    document
  );

}


/* =========================================================
   SEARCH DOCUMENTS
   ========================================================= */

async function searchTixitDocuments(
  query,
  options = {}
) {

  const documents =
    await getTixitDocuments();


  const cleanQuery =
    String(
      query || ""
    )
    .trim()
    .toLowerCase();


  if (!cleanQuery) {

    return documents;

  }


  const type =
    options.type ||
    "all";


  const favoritesOnly =
    Boolean(
      options.favoritesOnly
    );


  const pinnedOnly =
    Boolean(
      options.pinnedOnly
    );


  const terms =
    cleanQuery
      .split(/\s+/)
      .filter(Boolean);


  return documents.filter(
    document => {

      if (
        type !== "all" &&
        document.type !== type
      ) {

        return false;

      }


      if (
        favoritesOnly &&
        !document.favorite
      ) {

        return false;

      }


      if (
        pinnedOnly &&
        !document.pinned
      ) {

        return false;

      }


      const searchableText = [

        document.title,

        document.description,

        document.content,

        document.text,

        document.category,

        ...(document.tags || []),

        document.fileName

      ]
      .join(" ")
      .toLowerCase();


      return terms.every(
        term =>
          searchableText.includes(
            term
          )
      );

    }
  );

}


/* =========================================================
   SAVE SEARCH
   ========================================================= */

async function saveTixitSearch(query) {

  const clean =
    String(
      query || ""
    ).trim();


  if (!clean) {
    return;
  }


  const db =
    await tixitDBReady();


  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(
          ["searches"],
          "readwrite"
        );


      const store =
        transaction.objectStore(
          "searches"
        );


      const request =
        store.add({

          query:
            clean,

          createdAt:
            Date.now()

        });


      request.onsuccess =
        function () {

          resolve(
            request.result
          );

        };


      request.onerror =
        function () {

          reject(
            request.error
          );

        };

    }
  );

}


/* =========================================================
   GET SEARCH HISTORY
   ========================================================= */

async function getTixitSearchHistory() {

  const db =
    await tixitDBReady();


  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(
          ["searches"],
          "readonly"
        );


      const store =
        transaction.objectStore(
          "searches"
        );


      const request =
        store.getAll();


      request.onsuccess =
        function () {

          const result =
            request.result || [];


          result.sort(
            (a, b) =>
              b.createdAt -
              a.createdAt
          );


          resolve(
            result
          );

        };


      request.onerror =
        function () {

          reject(
            request.error
          );

        };

    }
  );

}


/* =========================================================
   SETTINGS
   ========================================================= */

async function getTixitSetting(key) {

  const db =
    await tixitDBReady();


  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(
          ["settings"],
          "readonly"
        );


      const store =
        transaction.objectStore(
          "settings"
        );


      const request =
        store.get(key);


      request.onsuccess =
        function () {

          resolve(
            request.result
              ? request.result.value
              : null
          );

        };


      request.onerror =
        function () {

          reject(
            request.error
          );

        };

    }
  );

}


async function saveTixitSetting(
  key,
  value
) {

  const db =
    await tixitDBReady();


  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(
          ["settings"],
          "readwrite"
        );


      const store =
        transaction.objectStore(
          "settings"
        );


      const request =
        store.put({

          key:
            key,

          value:
            value

        });


      request.onsuccess =
        function () {

          resolve(
            value
          );

        };


      request.onerror =
        function () {

          reject(
            request.error
          );

        };

    }
  );

}


/* =========================================================
   STATISTICS
   ========================================================= */

async function getTixitStatistics() {

  const documents =
    await getTixitDocuments();


  const searches =
    await getTixitSearchHistory();


  let characters = 0;


  documents.forEach(
    document => {

      characters +=
        String(
          document.content ||
          document.text ||
          ""
        ).length;

    }
  );


  return {

    documents:
      documents.length,

    text:
      documents.filter(
        d =>
          d.type === "text"
      ).length,

    pdf:
      documents.filter(
        d =>
          d.type === "pdf" ||
          d.mimeType ===
            "application/pdf"
      ).length,

    files:
      documents.filter(
        d =>
          d.type === "file"
      ).length,

    favorites:
      documents.filter(
        d =>
          d.favorite
      ).length,

    pinned:
      documents.filter(
        d =>
          d.pinned
      ).length,

    searches:
      searches.length,

    characters:
      characters

  };

}


/* =========================================================
   EXPORT DATABASE
   ========================================================= */

async function exportTixitDatabase() {

  const documents =
    await getTixitDocuments();


  const searches =
    await getTixitSearchHistory();


  const db =
    await tixitDBReady();


  const settings =
    await new Promise(
      (resolve, reject) => {

        const transaction =
          db.transaction(
            ["settings"],
            "readonly"
          );


        const store =
          transaction.objectStore(
            "settings"
          );


        const request =
          store.getAll();


        request.onsuccess =
          () => resolve(
            request.result || []
          );


        request.onerror =
          () => reject(
            request.error
          );

      }
    );


  return {

    app:
      "TIXIT",

    version:
      1,

    exportedAt:
      new Date().toISOString(),

    documents:
      documents,

    searches:
      searches,

    settings:
      settings

  };

}


/* =========================================================
   DOWNLOAD BACKUP
   ========================================================= */

async function downloadTixitBackup() {

  const data =
    await exportTixitDatabase();


  const json =
    JSON.stringify(
      data,
      null,
      2
    );


  const blob =
    new Blob(
      [json],
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


  const date =
    new Date()
      .toISOString()
      .slice(
        0,
        10
      );


  link.href =
    url;


  link.download =
    "TIXIT-backup-" +
    date +
    ".json";


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  URL.revokeObjectURL(
    url
  );

}


/* =========================================================
   IMPORT DATABASE
   ========================================================= */

async function importTixitDatabase(data) {

  if (
    !data ||
    typeof data !== "object"
  ) {

    throw new Error(
      "Invalid TIXIT backup"
    );

  }


  const db =
    await tixitDBReady();


  const documents =
    Array.isArray(
      data.documents
    )
      ? data.documents
      : [];


  const searches =
    Array.isArray(
      data.searches
    )
      ? data.searches
      : [];


  const settings =
    Array.isArray(
      data.settings
    )
      ? data.settings
      : [];


  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(
          [
            "documents",
            "searches",
            "settings"
          ],
          "readwrite"
        );


      const documentStore =
        transaction.objectStore(
          "documents"
        );


      const searchStore =
        transaction.objectStore(
          "searches"
        );


      const settingStore =
        transaction.objectStore(
          "settings"
        );


      /* Replace documents */

      documents.forEach(
        document => {

          documentStore.put(
            normalizeTixitDocument(
              document
            )
          );

        }
      );


      /* Replace searches */

      searches.forEach(
        search => {

          if (
            search &&
            search.query
          ) {

            searchStore.add({

              query:
                String(
                  search.query
                ),

              createdAt:
                Number(
                  search.createdAt ||
                  Date.now()
                )

            });

          }

        }
      );


      /* Replace settings */

      settings.forEach(
        setting => {

          if (
            setting &&
            setting.key
          ) {

            settingStore.put(
              setting
            );

          }

        }
      );


      transaction.oncomplete =
        function () {

          resolve(true);

        };


      transaction.onerror =
        function () {

          reject(
            transaction.error
          );

        };

    }
  );

}


/* =========================================================
   CLEAR DATABASE
   ========================================================= */

async function tixitClear() {

  const db =
    await tixitDBReady();


  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(
          [
            "documents",
            "searches"
          ],
          "readwrite"
        );


      transaction
        .objectStore(
          "documents"
        )
        .clear();


      transaction
        .objectStore(
          "searches"
        )
        .clear();


      transaction.oncomplete =
        function () {

          resolve(true);

        };


      transaction.onerror =
        function () {

          reject(
            transaction.error
          );

        };

    }
  );

}


/* =========================================================
   GLOBAL BACKUP HELPER
   ========================================================= */

window.downloadTixitBackup =
  downloadTixitBackup;


/* =========================================================
   AUTO INITIALIZATION
   ========================================================= */

initializeTixitDatabase()
  .catch(
    error => {

      console.error(
        "TIXIT Database Error:",
        error
      );

    }
  );