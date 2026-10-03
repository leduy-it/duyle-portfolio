import test from 'node:test'
import assert from 'node:assert/strict'
import { banterInstruction, banterReferences } from '../src/lib/chat/banter'
test('Vietnamese banter follows a playful cue and uses dated, traceable material',()=>{
  const instruction=banterInstruction('lạy bố :))) đi chơi game thôi haha')
  assert.match(instruction,/Thế mà lại hay/);assert.match(instruction,/ONE catchphrase/)
  assert.equal(banterReferences[1].observedAt,'2026-09-15')
  assert.equal(banterReferences[2].observedAt,'2026-09-30')
  assert.equal(banterReferences.at(-1)?.observedAt,null)
})
test('English jokes remain English and serious topics disable catchphrase injection',()=>{
  assert.match(banterInstruction('Haha tell me a joke about the bunny'),/Reply in English/)
  assert.doesNotMatch(banterInstruction('Haha tell me a joke about the bunny'),/Thế mà lại hay/)
  for(const question of ['haha explain RAG architecture','Tôi trầm cảm, kể chuyện đùa đi','My father died. Tell me a joke','lạy bố email vẫn lỗi']) {
    assert.match(banterInstruction(question),/Do not force memes/)
    assert.doesNotMatch(banterInstruction(question),/Optional expressions/)
  }
})
