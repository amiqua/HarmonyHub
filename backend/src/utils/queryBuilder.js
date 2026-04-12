/**
 * QueryBuilder for safe SQL construction with parameterized queries
 * Prevents SQL injection by enforcing parameterized query pattern
 */

export class QueryBuilder {
  constructor(baseQuery = "") {
    this.baseQuery = baseQuery;
    this.params = [];
    this.conditions = [];
    this.paramIndex = 1;
  }

  addParam(value) {
    this.params.push(value);
    return `$${this.paramIndex++}`;
  }

  addCondition(clause, ...values) {
    const placeholders = values.map(() => this.addParam(undefined)).join(", ");
    this.conditions.push(clause.replace("?", placeholders));
    return this;
  }

  addWhereClause(field, operator, value) {
    if (value !== undefined && value !== null) {
      const placeholder = this.addParam(value);
      this.conditions.push(`${field} ${operator} ${placeholder}`);
    }
    return this;
  }

  addWhereIn(field, values) {
    if (values && values.length > 0) {
      const placeholders = values.map((v) => this.addParam(v)).join(", ");
      this.conditions.push(`${field} IN (${placeholders})`);
    }
    return this;
  }

  addWhereILike(field, value) {
    if (value) {
      const placeholder = this.addParam(`%${value}%`);
      this.conditions.push(`LOWER(${field}) LIKE LOWER(${placeholder})`);
    }
    return this;
  }

  build() {
    let query = this.baseQuery;
    if (this.conditions.length > 0) {
      const whereClause = this.conditions.join(" AND ");
      query += ` WHERE ${whereClause}`;
    }
    return { query, params: this.params };
  }

  buildWithOr() {
    let query = this.baseQuery;
    if (this.conditions.length > 0) {
      const whereClause = this.conditions.join(" OR ");
      query += ` WHERE ${whereClause}`;
    }
    return { query, params: this.params };
  }
}
