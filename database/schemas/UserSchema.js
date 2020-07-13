const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const { LANGUAGES } = require( '../../config/constants' );

const UserNotificationsSchema = new Schema({
    activationCampaign: { type: Boolean, default: true },
    follow: { type: Boolean, default: true },
    fillOrder: { type: Boolean, default: true },
    mention: { type: Boolean, default: true },
    minimalTransfer: { type: Number, default: 0 },
    reblog: { type: Boolean, default: true },
    reply: { type: Boolean, default: true },
    'status-change': { type: Boolean, default: true },
    transfer: { type: Boolean, default: true },
    withdraw_route: { type: Boolean, default: true },
    witness_vote: { type: Boolean, default: true },
    myPost: { type: Boolean, default: false },
    myComment: { type: Boolean, default: false },
    like: { type: Boolean, default: true },
    downvote: { type: Boolean, default: false },
    claimReward: { type: Boolean, default: false },
}, { _id: false });

const UserAuthSchema = new Schema(
    {
        id: { type: String },
        provider: { type: String }
    }, { _id: false }
);

const UserMetadataSchema = new Schema( {
    notifications_last_timestamp: { type: Number, default: 0 },
    settings: {
        exitPageSetting: { type: Boolean, default: false }, // Enable this option to use the exit page when clicking on an external link.
        locale: { type: String, enum: [ ...LANGUAGES ], default: 'auto' }, // which language use on waivio
        postLocales: { type: [ { type: String, enum: [ ...LANGUAGES ] } ], default: [] }, // in which language do you want read posts
        nightmode: { type: Boolean, default: false }, // toggle nightmode on UI
        rewardSetting: { type: String, enum: [ 'SP', '50', 'STEEM' ], default: '50' }, // in which format get rewards from posts
        rewriteLinks: { type: Boolean, default: false }, // change links from steemit.com to waivio.com
        showNSFWPosts: { type: Boolean, default: false }, // show or hide NSFW posts
        upvoteSetting: { type: Boolean, default: false }, // enable auto like on your posts
        votePercent: { type: Number, min: 1, max: 10000, default: 10000 }, // default percent of your upvotes
        votingPower: { type: Boolean, default: true }, // dynamic toggle of vote power on each vote
        userNotifications: { type: UserNotificationsSchema }
    },
    bookmarks: { type: [ String ], default: [] },
    drafts: {
        type: [ {
            title: { type: String },
            author: { type: String },
            beneficiary: { type: Boolean, default: true },
            body: { type: String },
            jsonMetadata: { type: Object },
            lastUpdated: { type: Number },
            parentAuthor: { type: String },
            parentPermlink: { type: String },
            permlink: { type: String },
            reward: { type: String }
        } ],
        default: []
    },
    new_user: { type: Boolean, default: true }
} );
const UserSchema = new Schema( {
    name: { type: String, index: true, unique: true, required: true },
    alias: { type: String },
    objects_follow: { type: [ String ], default: [] }, // arr of author_permlink of objects what user following
    users_follow: { type: [ String ], default: [] }, // arr of users which user follow
    json_metadata: { type: String, default: '' },
    posting_json_metadata: { type: String, default: '' },
    wobjects_weight: { type: Number, default: 0 }, // sum of weight of all wobjects
    count_posts: { type: Number, default: 0, index: true }, // count of the all posts
    last_posts_count: { type: Number, default: 0 }, // count of the posts written in last day
    last_posts_counts_by_hours: { type: [ Number ], default: [] },
    user_metadata: { type: UserMetadataSchema, default: () => ( {} ), select: false },
    privateEmail: { type: String, default: null, select: false },
    auth: { type: UserAuthSchema },
    followers_count: { type: Number, default: 0 }
}, { timestamps: true } );

UserSchema.index( { wobjects_weight: -1 } );

const UserModel = mongoose.model( 'User', UserSchema );

module.exports = UserModel;
