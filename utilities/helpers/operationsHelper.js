const _ = require( 'lodash' );
const Requests = require( './api/requests' );
const { actionUrls, guestActions } = require( '../../config/constants' );

const transportAction = async( { params } ) => {
    const requestData = getRequestData( { actionType: params.id, userName: params.userName } );
    const { status, json, error } = await Requests.sendRequest( { path: requestData.url, type: requestData.type, params } );

    return { status, json, error };
};

const getRequestData = ( { actionType, userName } ) => {
    const urlType = _.findKey( guestActions, ( value ) => value.includes( actionType ) );
    const requestData = actionUrls[ urlType ];

    if( urlType === 'api' ) requestData.url = _.replace( requestData.url, ':user_name', userName );
    return requestData;
};

module.exports = {
    transportAction
};

