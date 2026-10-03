import { socialKnowledge } from '@/data/social-knowledge'
import { chatCatalog } from './catalog'
import experiences from '@/data/experience.json'
import posts from '@/data/blog-posts.json'
import films from '@/data/films.json'
import { lifeStories, lifeHighlights } from '@/data/life-stories'
import { PORTFOLIO_KNOWLEDGE } from './knowledge'
export interface KnowledgeDocument { id: string; text: string; source: string; cardId?: string }
export const knowledgeDocuments: KnowledgeDocument[] = [
  ...socialKnowledge,
  ...PORTFOLIO_KNOWLEDGE.split(/\n— /).filter(section => !section.startsWith('Cards and canonical')).map((text, i) => ({ id: `profile-${i}`, text: text.slice(0, 3200), source: 'https://leduy.vercel.app/' })),
  ...chatCatalog.map(card => ({id: card.id, text: `${card.title.en}. ${card.title.vi}. ${card.description.en} ${card.description.vi}`, source: `https://leduy.vercel.app${card.href}`, cardId: card.id})),
  ...lifeStories.map(story => ({id: `social-${story.id}`,text: `${story.title.en}. ${story.summary.en} ${story.summary.vi} Original post date ${story.date}. ${story.imageAlt || ''}. ${story.attachments?.map(a => a.alt).join('. ') || ''}`, source: story.sourceUrl, cardId: `life-${story.id}`})),
  ...lifeHighlights.map(story => ({id: `social-highlight-${story.id}`,text: `${story.title.en}. ${story.title.vi}. ${story.source} story highlight dated ${story.date}. Local video with original sound.`,source: story.sourceUrl, cardId: `highlight-${story.id}`})),
  ...experiences.map(item => ({id: `details-${item.slug}`, text: `${item.company}. ${item.title}. ${item.dates}. ${item.quote} ${item.missions.join('. ')} ${item.metrics?.map(m => `${m.value} ${m.label}`).join('. ') || ''}`, source: `https://leduy.vercel.app/experience/${item.slug}`,cardId:`work-${item.slug}`})),
  ...posts.map(post => ({id:`article-${post.slug}`,text: `${post.title}. ${post.excerpt}. ${JSON.stringify(post.content || []).slice(0, 4500)}`,source:`https://leduy.vercel.app/blog/${post.slug}`,cardId:`blog-${post.slug}`})),
  ...films.map(film => ({id:`film-${film.slug}`,text:`${film.title}. ${film.hook}. ${film.hook_vi}. Tags ${film.tags.join(', ')}. ${JSON.stringify(film.perspectives || []).slice(0, 2000)}`,source:`https://leduy.vercel.app/movie/${film.slug}`,cardId:`movie-${film.slug}`})),
]
export function normalizeText(value: string) { return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d') }
const stop = new Set('the a an is are of in on to for and about me his her it this that what does duy le tell show can please toi minh ban cua ve la co gi khong'.split(' '))
export function lexicalScores(query: string) {
  const words = [...new Set(normalizeText(query).split(/[^a-z0-9]+/).filter(w => w.length > 2 && !stop.has(w)))]
  return knowledgeDocuments.map(doc => {
    const text = normalizeText(doc.text)
    const score = words.reduce((sum, word) => sum + (text.includes(word) ? 1 / Math.sqrt(1 + knowledgeDocuments.filter(d => normalizeText(d.text).includes(word)).length) : 0),0)
    return {doc,score}
  })
}
export function lexicalRetrieve(query: string, limit = 6) { return lexicalScores(query).filter(item=>item.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(item=>item.doc) }
