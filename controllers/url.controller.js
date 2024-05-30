import { customAlphabet } from 'nanoid';
import URL from '../models/url.model.js';
import logger from '../logger.js';
import { calculateTimeLeft } from '../utils/calculateTimeLeft.js';

export async function generateShortURL(req, res, next) {
  const nanoid = customAlphabet('abcdefghikjlmnopqrstuvwxyz0123456789', 6);
  const shortID = nanoid();
  const url = req.body?.url;
  const expiry = Number(req.body?.expiry);

  if (url?.trim() === '' || !url) {
    return res.status(400).json({
      success: false,
      message: 'URL is required'
    });
  }

  let expiryDate = null;

  if (expiry) {
    if (isNaN(expiry)) {
      const error = new Error('Expiry must be a number (in seconds)');
      error.status = 400;
      return next(error);
    } else {
      expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + expiry);
    }
  }

  try {
    await URL.create({
      shortID: shortID,
      redirect: url,
      clicks: 0,
      history: [],
      expiry: expiryDate,
      status: 'active'
    });

    logger.info(`URL ${shortID} created for ${url}`);

    return res.status(201).json({
      success: true,
      message: `URL ${shortID} created for ${url}`,
      id: shortID,
      shortUrl: `${req.protocol}://${req.get('host')}/${shortID}`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating URL'
    });
  }
}

export async function getAnalytics(req, res, next) {
  const id = req.params.id;

  if (!id || id.trim() === '') {
    const error = new Error('URL ID is required');
    error.status = 400;
    return next(error);
  }

  try {
    const data = await URL.findOne({ shortID: id });

    if (!data) {
      const error = new Error('URL not found');
      error.status = 404;
      return next(error);
    }

    if (data.expiry) {
      const timeLeft = calculateTimeLeft(data.expiry);
      data.timeLeft = timeLeft;
    }

    const analytics = {
      url: data.redirect,
      clicks: data.totalClicks,
      history: data.history,
      shortID: data.shortID,
      expiry: data.timeLeft === 0 ? 0 : data.expiry,
      timeLeft: data.timeLeft,
      status: data.timeLeft === 0 ? 'expired' : 'active'
    };

    return res.status(200).json({
      success: true,
      message: analytics
    });
  } catch (error) {
    const errorMsg = new Error(error?.message || error);
    error.status = 500;
    return next(errorMsg);
  }
}
