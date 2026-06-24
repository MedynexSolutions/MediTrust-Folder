import { supabase } from "../config/supabase.js";

class Query {
  constructor(executor) {
    this.executor = executor;
    this.excludedFields = [];
  }

  select(fields) {
    if (typeof fields === "string") {
      this.excludedFields = fields
        .split(/\s+/)
        .filter((field) => field.startsWith("-"))
        .map((field) => field.slice(1));
    }

    return this;
  }

  then(resolve, reject) {
    return this.executor()
      .then((data) => stripFields(data, this.excludedFields))
      .then(resolve, reject);
  }

  catch(reject) {
    return this.then(undefined, reject);
  }

  finally(callback) {
    return Promise.resolve(this).finally(callback);
  }
}

const stripFields = (data, excludedFields) => {
  if (!excludedFields.length || !data) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => stripFields(item, excludedFields));
  }

  const copy = { ...data };
  excludedFields.forEach((field) => {
    delete copy[field];
  });
  return copy;
};

const toDocument = (row, methods = {}) => {
  if (!row) {
    return null;
  }

  const document = {
    ...row,
    _id: row.id
  };

  Object.entries(methods).forEach(([name, method]) => {
    Object.defineProperty(document, name, {
      enumerable: false,
      value: method.bind(document)
    });
  });

  return document;
};

const toDocuments = (rows, methods) => rows.map((row) => toDocument(row, methods));

const applyFilters = (query, filters = {}) => {
  return Object.entries(filters).reduce((currentQuery, [field, value]) => {
    return currentQuery.eq(field === "_id" ? "id" : field, value);
  }, query);
};

const runQuery = async (query) => {
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
};

export const createSupabaseModel = ({ table, methods = {}, beforeCreate }) => ({
  create: async (payload) => {
    const record = beforeCreate ? await beforeCreate({ ...payload }) : { ...payload };
    const data = await runQuery(
      supabase
        .from(table)
        .insert(record)
        .select("*")
        .single()
    );

    return toDocument(data, methods);
  },

  find: (filters = {}) =>
    new Query(async () => {
      const data = await runQuery(applyFilters(supabase.from(table).select("*"), filters));
      return toDocuments(data, methods);
    }),

  findOne: (filters = {}) =>
    new Query(async () => {
      const data = await runQuery(
        applyFilters(supabase.from(table).select("*"), filters).maybeSingle()
      );
      return toDocument(data, methods);
    }),

  findById: (id) =>
    new Query(async () => {
      const data = await runQuery(
        supabase
          .from(table)
          .select("*")
          .eq("id", id)
          .maybeSingle()
      );
      return toDocument(data, methods);
    })
});
