const { Schema, model } = require('mongoose');
const dayjs = require('dayjs');

dayjs.extend(require('dayjs/plugin/utc'));

const { PENDING } = require('../constants/postStatus');

const telegramPostSchema = new Schema({
  workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
  text: { type: String, required: true },
  channelId: { type: Number, required: true },
  postedAt: { type: Number, required: true, default: dayjs.utc().valueOf() },
  sendAt: { type: Number, required: false },
  buttons: { type: Array, required: false },
  status: { type: String, required: true, default: PENDING },
});

module.exports = model('TelegramPost', telegramPostSchema);
