const validators = require( './validators' );
const { OperationsHelper } = require( '../utilities/helpers' );
const render = require( '../concerns/render' );

const transportAction = async ( req, res ) => {
    const { params, validation_error } = validators.validate( req.body, validators.operations.transportShcema );

    if ( validation_error ) return render.error( res, validation_error );
    const { status, json, error } = await OperationsHelper.transportAction( { params } );

    if( error ) return render.unauthorized( res, error );

    return render.custom( res, status, json );
};

module.exports = {
    transportAction
};
