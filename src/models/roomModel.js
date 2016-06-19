module.exports = {
  fields: {
    id: {
      type: "uuid",
      default: {"$db_function": "uuid()"}
    },
    name: {
      type: "varchar"
    },
    createdAt: {
      type: "timestamp",
      default: {
        "$db_function": "toTimestamp(now())"
      }
    },
    createdBy: {
      type: "varchar"
    }
  },
  key: [["id"]],
};
