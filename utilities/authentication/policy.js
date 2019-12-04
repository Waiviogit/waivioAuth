const { check } = require( 'express-jwt-permissions' )();

const waivioPolicy = () => {
    return check( [ [ 'waivioAdmin' ] ] );
};

// const managePolicy = () => {
//     return check( [ [ 'superAdmin' ], [ 'admin' ] ] );
// };
//
// const superAdminPolicy = () => {
//     return check( [ 'superAdmin' ] );
// };

module.exports = { waivioPolicy };
