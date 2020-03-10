
exports.validate = ( key ) => {
    const { API_KEY } = process.env;
    return key === API_KEY;
};
