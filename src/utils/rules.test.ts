import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDuration, formatBytes, slugify, formatDate } from './formatters';
import { 
  validateUsername, 
  validateMediaFile, 
  validateEpisodeMetadata, 
  MAX_AUDIO_SIZE_BYTES, 
  MAX_VIDEO_SIZE_BYTES 
} from './validation';

test('formatDuration formats seconds correctly', () => {
  assert.equal(formatDuration(0), '0:00');
  assert.equal(formatDuration(45), '0:45');
  assert.equal(formatDuration(75), '1:15');
  assert.equal(formatDuration(3600), '1:00:00');
  assert.equal(formatDuration(3665), '1:01:05');
  assert.equal(formatDuration(-10), '0:00');
});

test('formatBytes formats bytes to readable scale', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1048576), '1 MB');
  assert.equal(formatBytes(1048576 * 5.5), '5.5 MB');
});

test('slugify transforms title into URL safe slug', () => {
  assert.equal(slugify('Echonova: The Future of Robotics @ JCOET!'), 'echonova-the-future-of-robotics-jcoet');
  assert.equal(slugify('Audio Podcast #10 - AI in 2026'), 'audio-podcast-10-ai-in-2026');
});

test('validateUsername checks alphanumeric and length constraints', () => {
  assert.equal(validateUsername('asthabansod').valid, true);
  assert.equal(validateUsername('jcoet_creator').valid, true);
  assert.equal(validateUsername('ab').valid, false);
  assert.equal(validateUsername('invalid user name!').valid, false);
  assert.equal(validateUsername('').valid, false);
});

test('validateMediaFile correctly identifies supported audio and video formats', () => {
  const validAudio = { name: 'episode1.mp3', size: 1024 * 1024 * 15, type: 'audio/mpeg' };
  assert.equal(validateMediaFile(validAudio, 'audio').valid, true);

  const oversizedAudio = { name: 'huge.mp3', size: MAX_AUDIO_SIZE_BYTES + 100, type: 'audio/mpeg' };
  assert.equal(validateMediaFile(oversizedAudio, 'audio').valid, false);

  const validVideo = { name: 'showcase.mp4', size: 1024 * 1024 * 50, type: 'video/mp4' };
  assert.equal(validateMediaFile(validVideo, 'video').valid, true);

  const wrongExt = { name: 'doc.pdf', size: 1000, type: 'application/pdf' };
  assert.equal(validateMediaFile(wrongExt, 'video').valid, false);
});

test('validateEpisodeMetadata validates required form fields', () => {
  const invalid = validateEpisodeMetadata({
    title: '',
    description: 'short',
    category: '',
    language: ''
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.title);
  assert.ok(invalid.errors.description);
  assert.ok(invalid.errors.category);
  assert.ok(invalid.errors.language);

  const valid = validateEpisodeMetadata({
    title: 'Building Modern Antenna Systems',
    description: 'An in-depth conversation with JCOET Electronics department faculty.',
    category: 'Engineering & Robotics',
    language: 'English'
  });
  assert.equal(valid.valid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});
