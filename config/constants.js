const config = require( './index' );

exports.LANGUAGES = [
    'en-US',
    'id-ID',
    'ms-MY',
    'ca-ES',
    'cs-CZ',
    'da-DK',
    'de-DE',
    'et-EE',
    'es-ES',
    'fil-PH',
    'fr-FR',
    'hr-HR',
    'it-IT',
    'hu-HU',
    'nl-HU',
    'no-NO',
    'pl-PL',
    'pt-BR',
    'ro-RO',
    'sl-SI',
    'sv-SE',
    'vi-VN',
    'tr-TR',
    'yo-NG',
    'el-GR',
    'bg-BG',
    'ru-RU',
    'uk-UA',
    'he-IL',
    'ar-SA',
    'ne-NP',
    'hi-IN',
    'as-IN',
    'bn-IN',
    'ta-IN',
    'lo-LA',
    'th-TH',
    'ko-KR',
    'ja-JP',
    'zh-CN',
    'auto'
];

exports.actionUrls = {
    custom_json: { url: `${config.waivioUrl}objects-bot/guest-custom-json`, type: 'post' },
    comment: { url: `${config.waivioUrl}objects-bot/guest-create-comment`, type: 'post' },
    api: { url: `${config.waivioUrl}api/:user_name/userMetadata`, type: 'put' },
    transfer: { url: `${config.waivioUrl}campaigns-api/guest/transfer`, type: 'post' }
};

exports.guestActions = {
    custom_json: [ 'waivio_guest_follow', 'waivio_guest_follow_wobject', 'waivio_guest_vote', 'waivio_guest_create', 'waivio_guest_reblog', 'waivio_guest_account_update', 'waivio_guest_bell' ],
    comment: [ 'waivio_guest_comment' ],
    api: [ 'waivio_guest_update' ],
    transfer: [ 'waivio_guest_transfer', 'overpayment_refund' ]
};
