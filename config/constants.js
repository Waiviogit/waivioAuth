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
    'af-ZA',
    'auto'
];

exports.actionUrls = {
    custom_json: { url: `${config.waivioUrl}objects-bot/guest-custom-json`, type: 'post' },
    comment: { url: `${config.waivioUrl}objects-bot/guest-create-comment`, type: 'post' },
    delete_comment: { url: `${config.waivioUrl}objects-bot/guest-delete-comment`, type: 'post' },
    api: { url: `${config.waivioUrl}api/:user_name/userMetadata`, type: 'put' },
    transfer: { url: `${config.waivioUrl}campaigns-api/guest/transfer`, type: 'post' }
};

exports.guestActions = {
    custom_json: [
        'add_referral_agent',
        'reject_referral_license',
        'confirm_referral_license',
        'waivio_guest_follow',
        'waivio_guest_follow_wobject',
        'waivio_guest_vote',
        'waivio_guest_create',
        'waivio_guest_reblog',
        'waivio_guest_account_update',
        'waivio_guest_bell',
        'waivio_guest_wobj_rating',
        'waivio_guest_hide_post',
        'waivio_guest_hide_comment'
    ],
    comment: [ 'waivio_guest_comment' ],
    delete_comment: [ 'waivio_guest_delete_comment' ],
    api: [ 'waivio_guest_update' ],
    transfer: [ 'waivio_guest_transfer', 'overpayment_refund' ]
};
