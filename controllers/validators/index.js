module.exports = {
  authentication: require('./authenticationValidator'),
  operations: require('./operationsValidator'),
  keyValidator: require('./keyValidator'),
  hiveAuth: require('./hiveAuthValidator'),
  validate: (data, schema) => {
    const result = schema.validate(data, { abortEarly: false });

    if (result.error) return { validation_error: result.error };

    return { params: result.value };
  },
};
