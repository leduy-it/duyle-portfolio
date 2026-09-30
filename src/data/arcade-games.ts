export type ArcadeCategory = 'all' | 'cozy' | 'flight' | 'combat' | 'worlds'

export interface ArcadeGame {
  id: string
  title: string
  creator: string
  category: Exclude<ArcadeCategory, 'all'>
  device: 'any' | 'desktop'
  url: string
  local?: boolean
  accent: string
  mark: string
  description: { en: string; vi: string }
  controls: { en: string; vi: string }
}

// Third-party games run from their creators' public sites. We do not ship their code or assets.
export const arcadeGames: ArcadeGame[] = [
  {
    id: 'sandline', title: 'SANDLINE', creator: 'xilinnihao-afk / 一海千寻的AI实验室',
    category: 'combat', device: 'any', url: 'https://ihca.cn/sandline/',
    accent: '#eeb775', mark: '砂',
    description: { en: 'Three against three. Take the site with your AI squad.', vi: 'Đấu 3v3. Cùng đồng đội AI chiếm cứ điểm.' },
    controls: { en: 'Keyboard + mouse · landscape touch on mobile · large first download', vi: 'Phím + chuột · điện thoại xoay ngang · lần đầu tải khá nặng' },
  },
  {
    id: 'mosswing', title: 'Mosswing', creator: 'Ayi1337',
    category: 'cozy', device: 'any', url: 'https://mosswing-quiet-flight.jack-514.chatgpt.site/',
    accent: '#b4e69a', mark: '✦',
    description: { en: 'One tap. A tiny pair of wings. One more try.', vi: 'Một cú chạm, đôi cánh nhỏ, rồi thêm một lần bay.' },
    controls: { en: 'Tap or Space to flap', vi: 'Chạm hoặc Space để vỗ cánh' },
  },
  {
    id: 'surge', title: 'SURGE for Oinja', creator: 'Olivia',
    category: 'combat', device: 'desktop', url: 'https://oinja-game.vercel.app/',
    accent: '#89d8f0', mark: 'ϟ',
    description: { en: 'Build electric powers, restore the city, reach the boss.', vi: 'Ghép kỹ năng điện, khôi phục thành phố, tìm trùm cuối.' },
    controls: { en: 'Desktop · keyboard and mouse', vi: 'Máy tính · phím và chuột' },
  },
  {
    id: 'thunderfall', title: 'THUNDERFALL', creator: 'jackroc',
    category: 'flight', device: 'any', url: 'https://thunderfall.vercel.app/',
    accent: '#f7a362', mark: '↟',
    description: { en: 'Five sectors, three fighters, one sky full of fire.', vi: 'Năm khu vực, ba chiến cơ, một bầu trời đầy đạn.' },
    controls: { en: 'Drag or keyboard · automatic fire', vi: 'Kéo hoặc dùng phím · tự động bắn' },
  },
  {
    id: 'magic-carpet', title: 'Magic Carpet Wizard', creator: 'threapchills',
    category: 'flight', device: 'desktop', url: 'https://threapchills.github.io/MagicCarpetWizard/',
    accent: '#d6b8ff', mark: '✧',
    description: { en: 'Thread glowing rings across a spherical world.', vi: 'Cưỡi thảm bay xuyên qua những vòng sáng trên một thế giới tròn.' },
    controls: { en: 'Desktop · mouse and keyboard · WebGL 2', vi: 'Máy tính · chuột và phím · cần WebGL 2' },
  },
  {
    id: 'harbor-skirmish', title: 'Harbor Skirmish', creator: 'OpenDesign',
    category: 'combat', device: 'desktop', url: 'https://gpt6astra-game.vercel.app/',
    accent: '#f3c196', mark: '⌁',
    description: { en: 'Rabbits have overrun the harbor. Take the rooftops back.', vi: 'Thỏ tràn vào bến cảng. Giành lại những mái nhà.' },
    controls: { en: 'Desktop · keyboard and mouse', vi: 'Máy tính · phím và chuột' },
  },
  {
    id: 'astra-floor', title: 'Astra Floor', creator: 'BEROCHLU',
    category: 'combat', device: 'desktop', url: 'https://astrafloor.berochlu.workers.dev/',
    accent: '#ff8d83', mark: '⌖',
    description: { en: 'Zombie waves, a katana, and a final boss.', vi: 'Từng đợt zombie, một thanh katana và trận trùm cuối.' },
    controls: { en: 'Desktop · keyboard and mouse', vi: 'Máy tính · phím và chuột' },
  },
  {
    id: 'iron-bastion', title: 'IRON BASTION', creator: 'chat01.ai',
    category: 'combat', device: 'any', url: 'https://iron-bastion.zecoba.workers.dev/',
    accent: '#f1b76c', mark: '▣',
    description: { en: 'Six sectors. Defend the beacon from armored waves.', vi: 'Giữ ngọn hải đăng qua sáu khu vực đầy xe tăng.' },
    controls: { en: 'Keyboard + mouse or touch · Chinese interface', vi: 'Phím + chuột hoặc cảm ứng · giao diện tiếng Trung' },
  },
  {
    id: 'vector-dive', title: 'Vector Dive', creator: 'Thomas Ricouard',
    category: 'flight', device: 'desktop', url: 'https://vector-dive.openai.chatgpt.site/',
    accent: '#87e8e3', mark: '◇',
    description: { en: 'A neon course that gets faster each lap.', vi: 'Đường đua neon càng bay càng nhanh.' },
    controls: { en: 'Desktop · WASD, Space boost, Shift phase', vi: 'Máy tính · WASD, Space tăng tốc, Shift đổi pha' },
  },
  {
    id: 'butterball', title: 'Butterball Run', creator: 'Seolyeon / SecretSeoul',
    category: 'cozy', device: 'any', url: 'https://butterball-run.jeraldine-t.chatgpt.site/',
    accent: '#f4d68e', mark: '◡',
    description: { en: 'Rescue eight mussels before dinner catches you.', vi: 'Cứu tám chú vẹm trước khi bữa tối bắt kịp.' },
    controls: { en: 'Drag or arrow keys', vi: 'Kéo hoặc dùng phím mũi tên' },
  },
  {
    id: 'komorebi', title: 'Komorebi', creator: 'Kazumi',
    category: 'cozy', device: 'any', url: 'https://komorebi-kinomi-0916.inu03550.chatgpt.site/',
    accent: '#bddd82', mark: '❀',
    description: { en: 'Gather falling nuts with a tiny forest spirit.', vi: 'Cùng linh hồn rừng nhỏ hứng hạt rơi.' },
    controls: { en: 'Mouse, touch, or arrow keys · Japanese interface', vi: 'Chuột, cảm ứng hoặc phím mũi tên · giao diện tiếng Nhật' },
  },
  {
    id: 'flop-club', title: 'FLOP CLUB', creator: 'BubuAi',
    category: 'cozy', device: 'any', url: 'https://bubucn.com/ai-model-evals/flop-club/game/index.html',
    accent: '#b9e7f1', mark: '↘',
    description: { en: 'Launch, flip, and land inside the ring.', vi: 'Nhảy, xoay người và đáp vào vòng mục tiêu.' },
    controls: { en: 'Keyboard or touch', vi: 'Phím hoặc cảm ứng' },
  },
  {
    id: 'gogh-strike', title: 'Gogh Strike', creator: 'Peter Gostev',
    category: 'combat', device: 'desktop', url: 'https://gogh-strike.surge.sh/',
    accent: '#e6ba6a', mark: '◉',
    description: { en: 'A paint-soaked arena with six artists and signature weapons.', vi: 'Đấu trường sơn màu với sáu họa sĩ và vũ khí riêng.' },
    controls: { en: 'Desktop · keyboard and mouse', vi: 'Máy tính · phím và chuột' },
  },
  {
    id: 'asteroids', title: 'ASTEROIDS · Deepfield', creator: 'Eyes Wide Open',
    category: 'flight', device: 'desktop', url: 'https://asteroids-deepfield-cockpit.dan200200.chatgpt.site/',
    accent: '#a2dced', mark: '◎',
    description: { en: 'Pilot a cockpit through debris with radar and twin cannons.', vi: 'Lái phi thuyền xuyên mảnh vỡ với radar và hai khẩu pháo.' },
    controls: { en: 'Desktop · keyboard', vi: 'Máy tính · bàn phím' },
  },
  {
    id: 'blackwater', title: 'BLACKWATER', creator: 'hiraeth',
    category: 'combat', device: 'desktop', url: 'https://blackwater-roan.vercel.app/',
    accent: '#a9c6ce', mark: '⌁',
    description: { en: 'Slip through a rain-soaked freight terminal.', vi: 'Lẻn qua bến hàng chìm trong mưa.' },
    controls: { en: 'Desktop · keyboard and mouse', vi: 'Máy tính · phím và chuột' },
  },
  {
    id: 'cinderfall', title: 'Cinderfall', creator: 'JUMPERZ',
    category: 'combat', device: 'desktop', url: 'https://rogue-omega.vercel.app/',
    accent: '#ed9881', mark: '♜',
    description: { en: 'Choose a champion and duel through six class abilities.', vi: 'Chọn tướng và đấu tay đôi với sáu bộ kỹ năng.' },
    controls: { en: 'Desktop · keyboard and mouse', vi: 'Máy tính · phím và chuột' },
  },
  {
    id: 'oz-breakdance', title: 'Oz Breakdance', creator: 'Satrio',
    category: 'cozy', device: 'desktop', url: 'https://satriodewantono.com/breakdance/',
    accent: '#e7acdf', mark: '✺',
    description: { en: 'Drag a ragdoll dancer into a very silly routine.', vi: 'Kéo tay chân vũ công để tạo màn breakdance ngớ ngẩn.' },
    controls: { en: 'Desktop · drag with mouse', vi: 'Máy tính · kéo bằng chuột' },
  },
  {
    id: 'underground-boxing', title: 'UNDERGROUND Boxing', creator: 'Sonic的奇思妙想',
    category: 'combat', device: 'desktop', url: 'https://iamsonic.net/2026/mini-games/underground-boxing.html',
    accent: '#f0a47c', mark: '✕',
    description: { en: 'Three rounds under the lights. Punch, block, dodge.', vi: 'Ba hiệp dưới ánh đèn. Đấm, đỡ, né.' },
    controls: { en: 'WASD move · J/K punch · L block · Space dodge', vi: 'WASD di chuyển · J/K đấm · L đỡ · Space né' },
  },
  {
    id: 'zero-district', title: 'Zero District', creator: 'Sonic的奇思妙想',
    category: 'combat', device: 'any', url: 'https://iamsonic.net/2026/mini-games/shells-3d/play.html',
    accent: '#b9da9d', mark: '⌖',
    description: { en: 'Survive three minutes in a city under siege.', vi: 'Sống sót ba phút trong thành phố bị bao vây.' },
    controls: { en: 'WASD or drag to move · automatic aim', vi: 'WASD hoặc kéo để di chuyển · tự ngắm' },
  },
  {
    id: 'ascii-district', title: 'ASCII DISTRICT', creator: 'Acker Code',
    category: 'combat', device: 'desktop', url: 'https://ascii-district.vercel.app/',
    accent: '#97edb6', mark: '#',
    description: { en: 'A shooter built entirely out of letters and symbols.', vi: 'Game bắn súng tạo nên từ chữ và ký hiệu.' },
    controls: { en: 'Desktop · keyboard + mouse · Esc releases cursor', vi: 'Máy tính · phím + chuột · Esc nhả con trỏ' },
  },
  {
    id: 'mr-nips', title: 'MR. NIPS', creator: 'TROY / @creepztopia',
    category: 'cozy', device: 'any', url: 'https://mr-nips-twin-laser-arcade.troybkk.chatgpt.site/',
    accent: '#efb9ce', mark: '✶',
    description: { en: 'A pixel hero, twin lasers, and too many drones.', vi: 'Anh hùng pixel, hai tia laser và cả bầy drone.' },
    controls: { en: 'Keyboard or drag to move', vi: 'Dùng phím hoặc kéo để di chuyển' },
  },
  {
    id: 'thornwake', title: 'Thornwake', creator: 'Lehiem / LiamTodd98',
    category: 'worlds', device: 'desktop', url: 'https://thornwake-moth-descent.ltodd.chatgpt.site/',
    accent: '#b8d99b', mark: '❧',
    description: { en: 'A needle, a dash, and a descent through tangled roots.', vi: 'Một cây kim, cú lướt và hành trình xuống rễ cây.' },
    controls: { en: 'Desktop · keyboard', vi: 'Máy tính · bàn phím' },
  },
  {
    id: 'tideglass', title: 'Tideglass Hunt', creator: 'Timothée Le Borgne',
    category: 'worlds', device: 'desktop', url: 'https://tideglass-hunt.timothee-leborgne.ohmyunicorn.com/',
    accent: '#8bdaca', mark: '≋',
    description: { en: 'Choose steel, storm, or frost for a coastal monster hunt.', vi: 'Chọn thép, bão hoặc băng để săn quái ven biển.' },
    controls: { en: 'Create Hunt → Start Solo · online connection', vi: 'Chọn Create Hunt → Start Solo · cần mạng' },
  },
  {
    id: 'mog-mode', title: 'Mog Mode', creator: 'Dylan Elder / Yesterday Arcade',
    category: 'cozy', device: 'any', url: 'https://yesterdayarcade.com/games/mog-mode/',
    accent: '#e8cf8f', mark: '✳',
    description: { en: 'Five ridiculous handshakes. Time them just right.', vi: 'Năm cái bắt tay lố bịch. Canh đúng nhịp nhé.' },
    controls: { en: 'Tap or Space', vi: 'Chạm hoặc Space' },
  },
  {
    id: 'the-crownless', title: 'The Crownless', creator: 'Izkimar',
    category: 'worlds', device: 'desktop', url: 'https://www.spawn.co/@izkimar/the-crownless/play',
    accent: '#d7bd92', mark: '♛',
    description: { en: 'Fight up a sandstone citadel and build a run toward the king.', vi: 'Chiến đấu lên thành đá và tiến tới vị vua.' },
    controls: { en: 'Desktop · keyboard and mouse · WebGPU + online', vi: 'Máy tính · phím và chuột · WebGPU + mạng' },
  },
  {
    id: 'last-beacon', title: 'Last Beacon', creator: 'stackloomdev',
    category: 'worlds', device: 'any', url: '/play/last-beacon/index.html', local: true,
    accent: '#f7d18b', mark: '◈',
    description: { en: 'Build your island defense with your companion nearby.', vi: 'Xây phòng tuyến trên đảo, pet của bạn ở ngay bên.' },
    controls: { en: 'Build on the pads · Space begins a wave · drag to orbit', vi: 'Xây trên bệ · Space bắt đầu đợt · kéo để xoay' },
  },
  {
    id: 'orbital-garden', title: 'Orbital Garden', creator: 'MartinDelophy',
    category: 'worlds', device: 'any', url: '/play/orbital-garden/index.html', local: true,
    accent: '#aaa5ff', mark: '✺',
    description: { en: 'Move 48,000 points of light with your companion.', vi: 'Cùng pet khuấy động 48.000 điểm sáng.' },
    controls: { en: 'Touch the stars · change formation · optional sound', vi: 'Chạm vào sao · đổi hình thái · tùy chọn âm thanh' },
  },
]
