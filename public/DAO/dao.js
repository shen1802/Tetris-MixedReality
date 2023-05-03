class dao {
  constructor(mysqlconnection) {
    this.mysqlconnection = mysqlconnection;
  }

  #queryBuilder(query_type, table, atributes, atributes_values, conditions, conditions_values,) {
    let query = "";
    if (query_type.toUpperCase() === "SELECT") {
      query = query + "SELECT ";
      if (atributes.length === 0) {
        query = query + "* ";
      } else {
        for (let i = 0; i < atributes.length - 1; i++) {
          query = query + atributes[i] + ",";
        }
        query = query + atributes[atributes.length - 1] + " ";
      }
      query = query + "from " + table + " ";
      if (conditions.length > 0) {
        for (let i = 0; i < conditions.length; i++) {
          if (i === 0) {
            query = query + "WHERE " + conditions[i] + "='" + conditions_values[i] + "' ";
          } else {
            query = query + "AND " + conditions[i] + "='" + conditions_values[i] + "' ";
          }
        }
      }

    } else if (query_type.toUpperCase() == "UPDATE") {
      query = query + "UPDATE " + table + " SET ";
      if (atributes.length === 0) {
        throw console.error("atributes has a value of 0 in UPDATE");
      } else {
        for (let i = 0; i < atributes.length - 1; i++) {
          query = query + atributes[i] + "='" + atributes_values[i] + "' ,";
        }
        query = query + atributes[atributes.length - 1] + "='" + atributes_values[atributes.length - 1] + " ";
      }
      if (conditions.length > 0) {
        for (let i = 0; i < conditions.length; i++) {
          if (i === 0) {
            query = query + "WHERE " + conditions[i] + "='" + conditions_values[i] + "' ";
          } else {
            query = query + "AND " + conditions[i] + "='" + conditions_values[i] + "' ";
          }
        }
      }

    } else if (query_type.toUpperCase() == "DELETE") {
      query = query + "DELETE FROM " + table + " ";
      if (conditions.length > 0) {
        for (let i = 0; i < conditions.length; i++) {
          if (i === 0) {
            query = query + "WHERE " + conditions[i] + "='" + conditions_values[i] + "' ";
          } else {
            query = query + "AND " + conditions[i] + "='" + conditions_values[i] + "' ";
          }
        }
      }

    } else if (query_type.toUpperCase() == "INSERT") {
      query = query + "INSERT INTO " + table + " (";
      for (let i = 0; i < atributes.length - 1; i++) {
        query = query + atributes[i] + ",";
      }
      query = query + atributes[atributes.length - 1] + ") VALUES (";
      for (let i = 0; i < atributes_values.length - 1; i++) {
        query = query + atributes_values[i] + ",";
      }
      query = query + atributes_values[atributes_values.length - 1] + ")";
    }

    return query;
  }

  get_query(query_type, table, atributes, atributes_values, conditions, conditions_values) {
    /*INSERT INTO table_name (column1, column2, column3, ...) VALUES (value1, value2, value3, ...);
      UPDATE table_name SET column1 = value1, column2 = value2, ... WHERE condition;
      DELETE FROM table_name WHERE condition;
      SELECT column1, column2, ... FROM table_name WHERE;
    */
    const query = this.#queryBuilder(
      query_type,
      table,
      atributes,
      atributes_values,
      conditions,
      conditions_values
    );
    
    this.mysqlconnection.query(query, function(error, result){});
  }

}

module.exports = dao;
