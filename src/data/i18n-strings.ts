/**
 * Locale dictionary for static UI chrome strings.
 *
 * - Add a key here once.
 * - Reference via `t('key')` from any client component (`useLocale()`).
 * - Server components: pass the locale as prop or read from cookies if needed.
 */

export type Locale = 'en' | 'vi'

export const I18N_STRINGS = {
  en: {
    // Brand
    'brand.lower': 'leduy.py',
    'brand.upper': 'LEDUY.PY',
    'brand.cursor': 'leduy.py_',
    'brand.shellPrompt': 'leduy.py ~ %',

    // Nav
    'nav.about': 'About Me',
    'nav.experience': 'Experience',
    'nav.blog': 'Blog Research',
    'nav.life': 'Life',
    'nav.cinema': 'Cinema',
    'nav.resume': 'Resume',

    // Locale toggle
    'locale.label': 'Language',
    'locale.en': 'English',
    'locale.vi': 'Tiếng Việt',

    // Hero — home
    'hero.welcome.before': 'Welcome to ',
    'hero.welcome.after': ' where I dig into research, ship agentic systems, and chase the occasional pixel.',
    'hero.now.currently': 'currently',
    'hero.now.previously': 'previously',
    'hero.now.reading': 'reading',
    'hero.now.openTo': 'open to',
    'hero.now.workingModes': 'working modes',
    'hero.now.buildHarness': 'core skill · AI build harness',
    'hero.pixelCaption': 'pixel.portrait / leduy.py',

    // Terminal chat
    'chat.statusOnline': 'Chat session opened.',
    'chat.banner': 'Ask anything about Duy\'s work, stack, or the cinema wall. I answer in a few sentences.',
    'chat.agentPrefix': "[Duy's agent]",
    'chat.placeholder': 'Ask me anything...',
    'chat.placeholderBusy': 'agent is replying...',
    'chat.statusBusy': 'thinking',
    'chat.statusIdle': 'online',
    'chat.reopen': 'reopen agent terminal',
    'chat.error': "I couldn't reach the channel just now — give it a moment and try again.",
    'chat.minimizedHint': 'minimized · drag from title bar to move ·',
    'chat.restore': 'restore',
    'chat.suggestionsLabel': 'Try',

    // Compose-to-Duy form
    'compose.title': 'Compose a note Duy will see',
    'compose.subjectLabel': 'Subject',
    'compose.subjectDefault': 'Hello from leduy.py — quick note',
    'compose.bodyLabel': 'Message',
    'compose.bodyPlaceholder': 'Drafting from your conversation...',
    'compose.fromLabel': 'Your email',
    'compose.fromPlaceholder': 'so Duy can reply to you',
    'compose.refine': 'Refine',
    'compose.refineInstructionLabel': 'How should I refine? (optional)',
    'compose.refineInstructionPlaceholder': 'e.g. "shorter", "more formal", "mention I\'m a frontend dev"',
    'compose.send': 'Send to Duy',
    'compose.cancel': 'Cancel',
    'compose.sentTitle': 'Message accepted for delivery. Duy can reply to your email.',
    'compose.sentBack': 'Back to chat',
    'compose.fallback': 'Send didn\'t go through. Open in your email app instead?',
    'compose.confirmNote': 'Your message goes to levduyit@gmail.com. Your email is used so Duy can reply.',
    'compose.button': 'Send to Duy',

    // Experience page
    'experience.heading': '<ExperienceDex />',
    'experience.tagline': '"Collecting experiences, populating the dex-entry by entry."',
    'experience.entries': 'entries',
    'experience.lastUpdated': 'last_updated',
    'experience.viewLink': '$ view --slug',
    'experience.backToDex': '← back to dex',
    'experience.cdBack': '$ cd ../experience',
    'experience.missions': 'Missions',
    'experience.fieldNotes': 'Field notes',
    'experience.gallery': 'Gallery',
    'experience.stack': 'Stack',
    'experience.resources': 'Resources',
    'experience.visit': 'Visit',
    'experience.viewOnLinkedIn': 'View on LinkedIn',
    'experience.officialPage': 'Official page',
    'experience.checksum': 'checksum',
    'experience.systemHeader': 'SYSTEM: DEX_ENTRIES_LOADED',
    'experience.systemCount': 'COUNT',
    'experience.systemStatus': 'STATUS: VERIFIED',
    'experience.systemChecksum': 'CHECKSUM',
    'experience.deliveredNetwork': 'Delivered Network',
    'experience.deliveredCountLabel': 'production handoffs',

    // Blog (now "Research")
    'blog.heading': 'Research notes from the production floor',
    'blog.eyebrow': 'research · long-form notes',
    'blog.intro': 'Field notes from shipping AI in Vietnam — OCR backbones, agent design, latency war stories, the unglamorous middle of production.',
    'blog.readMore': 'read note',
    'blog.cdBack': '$ cd ../research',
    'blog.backAll': '← back to all notes',
    'blog.minRead': 'min read',

    // Cinema (photography route)
    'cinema.eyebrow': 'cinema',
    'cinema.title': 'Films I keep returning to',
    'cinema.body': 'Some days I want sand and prophecy. Some days I want rain on concrete, cymbals on fire, or a room full of people realizing too late what they have built. This wall is for the films that do not leave cleanly.',
    'cinema.galleryEyebrow': '// films i keep returning to',
    'cinema.galleryTitle': 'Eight posters. Eight moods that still stay lit.',
    'cinema.galleryBody': 'Not reviews, not rankings. Just films that keep leaving a residue behind: heat, static, rain, brass, dread, and the occasional clean line of awe.',
    'cinema.cdBack': '$ cd ../cinema',
    'cinema.backToCinema': '← back to cinema',
    'cinema.viewNotes': 'view notes →',
    'cinema.notes': 'Notes',
    'cinema.multiAngle': 'Multi-angle',
    'cinema.takeaway': 'Takeaway',

    // Mailto / outbound
    'mailto.subject': 'hello from leduy.py',
    'mailto.signature': '— sent from leduy.py',
  },
  vi: {
    // Brand
    'brand.lower': 'leduy.py',
    'brand.upper': 'LEDUY.PY',
    'brand.cursor': 'leduy.py_',
    'brand.shellPrompt': 'leduy.py ~ %',

    // Nav
    'nav.about': 'Giới thiệu',
    'nav.experience': 'Kinh nghiệm',
    'nav.blog': 'Blog Nghiên cứu',
    'nav.life': 'Đời thường',
    'nav.cinema': 'Điện ảnh',
    'nav.resume': 'CV',

    // Locale toggle
    'locale.label': 'Ngôn ngữ',
    'locale.en': 'English',
    'locale.vi': 'Tiếng Việt',

    // Hero — home
    'hero.welcome.before': 'Chào mừng đến với ',
    'hero.welcome.after': ' — nơi tôi đào sâu nghiên cứu, ship hệ thống agentic, và đuổi theo vài ô pixel khi rảnh.',
    'hero.now.currently': 'hiện tại',
    'hero.now.previously': 'trước đó',
    'hero.now.reading': 'đang đọc',
    'hero.now.openTo': 'sẵn sàng',
    'hero.now.workingModes': 'cách làm việc',
    'hero.now.buildHarness': 'kỹ năng cốt lõi · AI build harness',
    'hero.pixelCaption': 'pixel.portrait / leduy.py',

    // Terminal chat — STATUS: prefix + bracket prefix stay English-styled
    'chat.statusOnline': 'Đã mở phiên trò chuyện.',
    'chat.banner': 'Hỏi tôi bất cứ điều gì về công việc, stack, hay danh sách phim của Duy. Tôi trả lời trong vài câu.',
    'chat.agentPrefix': '[Duy\'s agent]',
    'chat.placeholder': 'Hỏi tôi bất cứ điều gì...',
    'chat.placeholderBusy': 'trợ lí đang trả lời...',
    'chat.statusBusy': 'đang suy nghĩ',
    'chat.statusIdle': 'online',
    'chat.reopen': 'mở lại terminal',
    'chat.error': 'Tôi chưa kết nối được, đợi chút và thử lại nhé.',
    'chat.minimizedHint': 'đã thu nhỏ · kéo title bar để di chuyển ·',
    'chat.restore': 'mở lại',
    'chat.suggestionsLabel': 'Thử',

    // Compose-to-Duy form
    'compose.title': 'Soạn một tin nhắn Duy sẽ thấy',
    'compose.subjectLabel': 'Tiêu đề',
    'compose.subjectDefault': 'Xin chào từ leduy.py — một lời nhắn',
    'compose.bodyLabel': 'Nội dung',
    'compose.bodyPlaceholder': 'Đang phác thảo từ cuộc trò chuyện...',
    'compose.fromLabel': 'Email của bạn',
    'compose.fromPlaceholder': 'để Duy có thể trả lời',
    'compose.refine': 'Tinh chỉnh',
    'compose.refineInstructionLabel': 'Tinh chỉnh theo hướng nào? (không bắt buộc)',
    'compose.refineInstructionPlaceholder': 'ví dụ "ngắn gọn hơn", "trang trọng hơn", "nói rõ tôi là frontend dev"',
    'compose.send': 'Gửi đến Duy',
    'compose.cancel': 'Huỷ',
    'compose.sentTitle': 'Đã tiếp nhận để gửi. Duy có thể trả lời qua email của bạn.',
    'compose.sentBack': 'Quay lại chat',
    'compose.fallback': 'Gửi không thành công. Mở trong ứng dụng email của bạn?',
    'compose.confirmNote': 'Tin nhắn được gửi đến levduyit@gmail.com. Email của bạn giúp Duy trả lời.',
    'compose.button': 'Gửi đến Duy',

    // Experience page — dev-style tokens stay English in both locales
    'experience.heading': '<ExperienceDex />',
    'experience.tagline': '"Thu thập trải nghiệm — từng entry một."',
    'experience.entries': 'entries',
    'experience.lastUpdated': 'last_updated',
    'experience.viewLink': '$ view --slug',
    'experience.backToDex': '← về danh sách',
    'experience.cdBack': '$ cd ../experience',
    'experience.missions': 'Missions',
    'experience.fieldNotes': 'Ghi chú thực địa',
    'experience.gallery': 'Thư viện',
    'experience.stack': 'Stack',
    'experience.resources': 'Tài nguyên',
    'experience.visit': 'Truy cập',
    'experience.viewOnLinkedIn': 'Xem trên LinkedIn',
    'experience.officialPage': 'Trang chính thức',
    'experience.checksum': 'checksum',
    'experience.systemHeader': 'SYSTEM: DEX_ENTRIES_LOADED',
    'experience.systemCount': 'COUNT',
    'experience.systemStatus': 'STATUS: VERIFIED',
    'experience.systemChecksum': 'CHECKSUM',
    'experience.deliveredNetwork': 'Mạng lưới triển khai',
    'experience.deliveredCountLabel': 'khách hàng production',

    // Blog (now "Research") — bash command stays English
    'blog.heading': 'Ghi chú nghiên cứu từ tầng sản xuất',
    'blog.eyebrow': 'nghiên cứu · ghi chú dài',
    'blog.intro': 'Ghi chú từ việc ship AI ở Việt Nam — OCR backbone, thiết kế agent, chiến trận latency, phần lưng chừng không hào nhoáng của sản xuất.',
    'blog.readMore': 'đọc ghi chú',
    'blog.cdBack': '$ cd ../research',
    'blog.backAll': '← về tất cả ghi chú',
    'blog.minRead': 'phút đọc',

    // Cinema (photography route) — code-comment + bash + markdown labels stay English
    'cinema.eyebrow': 'điện ảnh',
    'cinema.title': 'Những bộ phim tôi cứ quay lại',
    'cinema.body': 'Có hôm tôi muốn cát và lời tiên tri. Có hôm tôi muốn mưa trên bê tông, cymbals cháy, hay một căn phòng đầy người nhận ra quá muộn cái mình vừa dựng nên. Wall này dành cho những bộ phim không rời đi sạch sẽ.',
    'cinema.galleryEyebrow': '// films i keep returning to',
    'cinema.galleryTitle': 'Tám poster. Tám tâm trạng vẫn còn rực sáng.',
    'cinema.galleryBody': 'Không phải review, không phải xếp hạng. Chỉ là những bộ phim để lại dư âm: hơi nóng, tĩnh điện, mưa, kèn đồng, sợ hãi, và đôi lần là một đường nét sạch của sự choáng ngợp.',
    'cinema.cdBack': '$ cd ../cinema',
    'cinema.backToCinema': '← về danh sách phim',
    'cinema.viewNotes': 'xem ghi chú →',
    'cinema.notes': 'Notes',
    'cinema.multiAngle': 'Multi-angle',
    'cinema.takeaway': 'Takeaway',

    // Mailto / outbound
    'mailto.subject': 'xin chào từ leduy.py',
    'mailto.signature': '— gửi từ leduy.py',
  },
} as const

export type LocaleKey = keyof (typeof I18N_STRINGS)['en']
