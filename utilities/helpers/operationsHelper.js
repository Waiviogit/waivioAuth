const axios = require( 'axios' );
const _ = require( 'lodash' );
const { actionUrls, guestActions } = require( '../../config/constants' );

const getRoute = ( { actionType } ) => {
    const urlType = _.findKey( guestActions, ( value ) => {
        return value.includes( actionType );
    } );

    return actionUrls[ urlType ];
};
