import test from 'node:test'
import assert from 'node:assert/strict'
import { chatCatalog, discoverCards, safeChatHref } from '../src/lib/chat/catalog'

test('discovery covers bilingual game, life, pet, work and cinema intents with real routes', () => {
  for (const [question, route] of [
    ['Tôi muốn chơi game', '/arcade'], ['Show me Duy’s life photos', '/life'],
    ['Có gì thú vị với pet?', '/pets'], ['Duy có kinh nghiệm gì?', '/experience'],
    ['Recommend a movie tonight', '/movie'],
  ]) assert.ok(discoverCards(question).some(card => card.href.startsWith(route)), question)
  const story = chatCatalog.find(card => card.id === 'life-camera-on')!
  assert.equal(story.video, '/videos/life/facebook-camera-2026.mp4')
  assert.equal(story.image, '/images/life/facebook-camera-2026.jpg')
})

test('assistant links only open catalog destinations and known public contact links', () => {
  assert.equal(safeChatHref('/life#camera-on'), '/life#camera-on')
  assert.equal(safeChatHref('/movie/arrival'), '/movie/arrival')
  for (const href of ['javascript:alert(1)', '//evil.example', '/admin', '/api/contact', 'https://evil.example', '/life#missing'])
    assert.equal(safeChatHref(href), null, href)
})

test('specific films and stories take priority over general suggestions', () => {
  assert.equal(discoverCards('Tell me about Arrival')[0].href, '/movie/arrival')
  assert.ok(discoverCards('hackathon').some(card => card.id === 'life-soict-hackathon'))
  assert.equal(discoverCards('unknown random question').length, 0)
})
