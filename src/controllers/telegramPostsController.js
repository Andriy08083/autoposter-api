const bot = require('../bot');

const workspaceService = require('../services/workspaceService');
const telegramChannelService = require('../services/telegramChannelService');
const telegramPostService = require('../services/telegramPostService');

const ApiError = require('../helpers/apiError');
const { ERRORS } = require('../constants/validation');
const { BAD_REQUEST, OK, NOT_FOUND } = require('../constants/responseStatus');
const { removeHtmlTagsRegExp } = require('../constants/regExp');
const { SENT } = require('../constants/postStatus');
const { ADMIN } = require('../constants/userRoles');

const getPosts = async (req, res, next) => {
  try {
    const { workspace } = req;

    const posts = await telegramPostService.getTelegramPostsByWorkspaceId(workspace._id);

    res.send(posts);
  } catch (e) {
    next(e);
  }
};

const sendPostToTelegramChannel = async (req, res, next) => {
  try {
    const { channelId, postText, buttons } = req.body;

    const workspace = await workspaceService.findOne({ user: req.user._id });

    const telegramChannel = await telegramChannelService.findOne({
      channelId,
    }).populate('integration');

    if (!telegramChannel) {
      return next(new ApiError(BAD_REQUEST, ERRORS.TELEGRAM_CHANNEL_NOT_FOUND));
    }

    if (telegramChannel.integration.workspace.toString() !== workspace._id.toString()) {
      return next(new ApiError(BAD_REQUEST, ERRORS.TELEGRAM_CHANNEL_NOT_FOUND));
    }

    const preparedMessage = postText.replace(removeHtmlTagsRegExp, '');

    await bot.sendMessage(channelId, preparedMessage, {
      parse_mode: 'html',
      reply_markup: {
        inline_keyboard: [buttons],
      },
    });

    await telegramPostService.create({
      workspace: workspace._id,
      channelId,
      text: preparedMessage,
      status: SENT,
    });

    return res.sendStatus(OK);
  } catch (e) {
    return next(e);
  }
};

const schedulePostToTelegramChannel = async (req, res, next) => {
  try {
    const {
      channelId,
      postText,
      buttons,
      sendAt,
    } = req.body;

    const workspace = await workspaceService.findOne({ user: req.user._id });

    const telegramChannel = await telegramChannelService.findOne({
      channelId,
    }).populate('integration');

    if (!telegramChannel) {
      return next(new ApiError(BAD_REQUEST, ERRORS.TELEGRAM_CHANNEL_NOT_FOUND));
    }

    if (telegramChannel.integration.workspace.toString() !== workspace._id.toString()) {
      return next(new ApiError(BAD_REQUEST, ERRORS.TELEGRAM_CHANNEL_NOT_FOUND));
    }

    const preparedMessage = postText.replace(removeHtmlTagsRegExp, '');

    await telegramPostService.create({
      workspace: workspace._id,
      channelId,
      text: preparedMessage,
      buttons,
      sendAt,
    });

    return res.sendStatus(OK);
  } catch (e) {
    return next(e);
  }
};

const sendPostById = async (req, res, next) => {
  const { workspace, user } = req;
  const { postId } = req.params;

  const post = await telegramPostService.findOne({ _id: postId });

  if (!post) {
    return next(new ApiError(NOT_FOUND, ERRORS.TELEGRAM_POST_NOT_FOUND));
  }

  if (user.role === ADMIN) {
    await telegramPostService.sendTelegramPost(post);
    return res.sendStatus(OK);
  }

  if (post.workspace.toString() !== workspace._id.toString()) {
    return next(new ApiError(NOT_FOUND, ERRORS.TELEGRAM_POST_NOT_FOUND));
  }

  await telegramPostService.sendTelegramPost(post);
  return res.sendStatus(OK);
};

const deletePostById = async (req, res, next) => {
  const { workspace, user } = req;
  const { postId } = req.params;

  const post = await telegramPostService.findOne({ _id: postId });

  if (!post) {
    return next(new ApiError(NOT_FOUND, ERRORS.TELEGRAM_POST_NOT_FOUND));
  }

  if (user.role === ADMIN) {
    await post.remove();
    return res.sendStatus(OK);
  }

  if (post.workspace.toString() !== workspace._id.toString()) {
    return next(new ApiError(NOT_FOUND, ERRORS.TELEGRAM_POST_NOT_FOUND));
  }

  await post.remove();
  return res.sendStatus(OK);
};

module.exports = {
  getPosts,
  sendPostToTelegramChannel,
  schedulePostToTelegramChannel,
  sendPostById,
  deletePostById,
};
