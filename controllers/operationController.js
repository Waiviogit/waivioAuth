const validators = require( './validators' );
const { OperationsHelper } = require( '../utilities/helpers' );
const render = require( '../concerns/render' );

const transportAction = async ( req, res ) => {
    const { params, validation_error } = validators.validate( req.body, validators.operations.transportShcema );

    if ( validation_error ) return render.error( res, validation_error );
    const { status, json, message } = await OperationsHelper.transportAction( { params, access_token: req.headers[ 'access-token' ] } );

    return render.custom( res, status, json || message );
};

module.exports = {
    transportAction
};
