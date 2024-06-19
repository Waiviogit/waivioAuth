const axios = require('axios');
const FormData = require('form-data');
const config = require('../../../config');

const sendRequest = async ({
  path, type, params, access_token, objectBotKey,
}) => axios({
  baseURL: path,
  method: type,
  data: params,
  headers: {
    'access-token': access_token,
    'waivio-auth': true,
    ...objectBotKey && { 'access-key': objectBotKey },

  },
})
  .then((response) => getResponse({ response }))
  .catch((error) => getResponse({ response: error.response }));

const getResponse = ({ response }) => {
  const status = response && response.status || 500;
  const { message, json } = response && response.data || {};

  return { status, message, json };
};

const uploadAvatar = async ({ userName, imageUrl }) => {
  const formData = new FormData();

  const boundary = formData.getBoundary();

  formData.append('imageUrl', imageUrl);
  formData.append('type', 'avatar');
  formData.append('userName', userName);

  return await axios.post(
    `${config.waivioUrl}api/image`,
    formData,
    { headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` } },
  )
    .then((response) => response.data && response.data.image)
    .catch((error) => null);
};

module.exports = {
  sendRequest,
  uploadAvatar,
};
