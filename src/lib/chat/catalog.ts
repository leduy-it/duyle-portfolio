import films from '@/data/films.json'
import posts from '@/data/blog-posts.json'
import experiences from '@/data/experience.json'
import { lifeHighlights, lifeStories } from '@/data/life-stories'
import { arcadeGames } from '@/data/arcade-games'

type Localized = { en: string; vi: string }
export interface ChatCard {
  id: string
  href: string
  category: 'life' | 'work' | 'blog' | 'movie' | 'arcade' | 'pets'
  title: Localized
  description: Localized
  image?: string
  video?: string
  source?: string
}

export const chatCatalog: ChatCard[] = [
  {id:'profile-portrait',href:'/life',category:'life',title:{en:'Duy, in person',vi:'Một tấm chân dung Duy'},description:{en:'A portrait from Duy’s public LinkedIn profile.',vi:'Chân dung từ hồ sơ LinkedIn công khai của Duy.'},image:'/images/life/linkedin-portrait.jpeg',source:'LinkedIn'},
  { id: 'arcade', href: '/arcade', category: 'arcade', title: { en: 'The Arcade', vi: 'Ghé Arcade' }, description: { en: 'Play a quick game or explore a pocket world.', vi: 'Chơi một ván ngắn hoặc khám phá thế giới nhỏ.' }, image: '/pets/world-arrival.webp' },
  { id: 'pets', href: '/pets', category: 'pets', title: { en: 'Pocket World', vi: 'Thế giới pet' }, description: { en: 'Hatch, grow, build and go on an expedition.', vi: 'Ấp trứng, nuôi pet, xây nhà và đi thám hiểm.' }, image: '/pets/pixel-garden-v2.webp' },
  { id: 'life', href: '/life', category: 'life', title: { en: 'Life, in frames', vi: 'Cuộc sống qua khung hình' }, description: { en: 'Duy’s photos, daily moments and video highlights.', vi: 'Ảnh, ngày thường và video highlight của Duy.' }, image: '/images/life/linkedin-portrait.jpeg' },
  { id: 'experience', href: '/experience', category: 'work', title: { en: 'Experience', vi: 'Kinh nghiệm của Duy' }, description: { en: 'Projects, experiments and shipped work.', vi: 'Dự án, thử nghiệm và những gì đã triển khai.' } },
  { id: 'movie', href: '/movie', category: 'movie', title: { en: 'Cinema wall', vi: 'Góc điện ảnh' }, description: { en: 'Browse Duy’s film notes and watchlist.', vi: 'Xem ghi chú phim và danh sách của Duy.' } },
  { id: 'blog', href: '/blog', category: 'blog', title: { en: 'Engineering notes', vi: 'Ghi chú kỹ thuật' }, description: { en: 'Read the thinking behind the work.', vi: 'Đọc những suy nghĩ phía sau công việc.' } },
  ...lifeStories.map(item => ({ id: `life-${item.id}`, href: `/life#${item.id}`, category: 'life' as const, title: item.title, description: item.summary, image: item.image, video: item.video, source: item.source })),
  ...lifeStories.flatMap(story => (story.attachments || []).map((attachment,index) => ({id:`photo-${story.id}-${index}`,href:`/life#${story.id}`,category:'life' as const,title:{en:attachment.alt,vi:story.title.vi},description:{en:story.summary.en,vi:story.summary.vi},image:attachment.image,source:story.source}))),
  ...lifeHighlights.map(item => ({ id: `highlight-${item.id}`, href: `/life#${item.id}`, category: 'life' as const, title: item.title, description: { en: `Video highlight · ${item.date}`, vi: `Video highlight · ${item.date}` }, image: item.poster, video: item.video, source: item.source })),
  ...films.map(item => ({ id: `movie-${item.slug}`, href: `/movie/${item.slug}`, category: 'movie' as const, title: { en: item.title, vi: item.title }, description: { en: item.hook, vi: item.hook_vi }, image: item.image, source: item.tags.includes('anticipated') ? 'Watchlist · anticipated' : 'Cinema notes' })),
  ...posts.map(item => ({ id: `blog-${item.slug}`, href: `/blog/${item.slug}`, category: 'blog' as const, title: { en: item.title, vi: item.title_vi }, description: { en: item.excerpt, vi: item.excerpt_vi }, image: item.image })),
  ...experiences.map(item => ({ id: `work-${item.slug}`, href: `/experience/${item.slug}`, category: 'work' as const, title: { en: `${item.company} · ${item.title}`, vi: `${item.company} · ${item.title_vi}` }, description: { en: item.quote, vi: item.quote_vi }, image: item.image })),
  ...arcadeGames.map(item => ({ id: `game-${item.id}`, href: `/arcade?game=${item.id}`, category: 'arcade' as const, title: { en: item.title, vi: item.title }, description: item.description, source: item.creator })),
]

const allowedLinks = new Set([
  ...chatCatalog.map(card => card.href), '/', '/#terminal-chat',
  'https://www.linkedin.com/in/leduy-it/', 'https://github.com/leduy-it',
  'https://www.instagram.com/leduy.py/', 'https://fb.com/duyekko', 'mailto:levduyit@gmail.com',
])

export function safeChatHref(value: string): string | null {
  if (allowedLinks.has(value)) return value
  try {
    const url = new URL(value)
    if (url.origin === 'https://leduy.vercel.app') {
      const local = url.pathname + url.search + url.hash
      if (allowedLinks.has(local)) return local
    }
  } catch { /* unknown destinations stay inert */ }
  return null
}

function normalized(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase()
}

export function discoverCards(question: string): ChatCard[] {
  const query = normalized(question)
  if (/\b(portrait|portraits|face|handsome|dep trai|hinh cua|anh cua|picture of|pictures of|photos of|look like|show me duy)\b/.test(query)) return ['profile-portrait','life-leaf-portrait','life-outside','life-camera-on'].flatMap(id=>chatCatalog.filter(card=>card.id===id))
  const exact = chatCatalog.filter(card => [card.title.en, card.title.vi, card.id.replace(/^(life|movie|game|work|blog)-/, '').replace(/-/g, ' ')]
    .some(title => normalized(title).length >= 6 && query.includes(normalized(title))))
  if (exact.length) return exact.slice(0, 4)
  let ids: string[] = []
  if (/\b(game|games|arcade|choi|play)\b/.test(query)) ids = ['arcade', 'game-last-beacon', 'game-mosswing']
  else if (/\b(pet|pets|thu vi|fun|hatch|egg|trung)\b/.test(query)) ids = ['pets', 'arcade']
  else if (/\b(movie|movies|film|films|phim|cinema)\b/.test(query)) ids = ['movie', 'movie-arrival', 'movie-interstellar']
  else if (/\b(life|anh|photo|photos|story|stories|doi thuong|cuoc song|highlight)\b/.test(query)) ids = ['life', 'life-camera-on', 'life-leaf-portrait']
  else if (/\b(hackathon|soict)\b/.test(query)) ids = ['life-soict-hackathon', 'work-soict-hackathon']
  else if (/\b(experience|experiment|experiments|kinh nghiem|cong viec|project|projects|du an|build|career)\b/.test(query)) ids = ['experience', 'work-growtrics', 'blog']
  else if (/\b(blog|writing|bai viet|viet|read|doc)\b/.test(query)) ids = ['blog']
  return ids.flatMap(id => { const card = chatCatalog.find(item => item.id === id); return card ? [card] : [] })
}

export function cardsFromReply(reply: string, question = ''): ChatCard[] {
  const ids = [...reply.matchAll(/\[\[(?:card:)?([a-z0-9-]+)\]\]/g)].map(match => match[1])
  const links = [...reply.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map(match => safeChatHref(match[1]))
  const explicit = chatCatalog.filter(card => ids.includes(card.id) || links.includes(card.href))
  return (explicit.length ? explicit : discoverCards(question)).slice(0, 4)
}
