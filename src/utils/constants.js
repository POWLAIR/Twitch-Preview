import { ENV } from './env.js';

export const CACHE = {
    STREAMS_KEY: 'cachedStreams',
    USER_KEY: 'cachedUser',
    REFRESH_INTERVAL: ENV.CACHE_REFRESH_INTERVAL,
    MAX_AGE: ENV.CACHE_MAX_AGE
};

export const ANIMATIONS = {
    FADE_DURATION: ENV.ANIMATION_FADE_DURATION,
    SLIDE_DURATION: ENV.ANIMATION_SLIDE_DURATION
}; 