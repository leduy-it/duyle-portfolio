export type LifeStory = {
  id: string
  date: string
  displayDate: string
  kind: 'photo' | 'video' | 'external-video'
  source: 'Instagram' | 'Facebook' | 'LinkedIn'
  sourceUrl: string
  image?: string
  imageAlt?: string
  video?: string
  attachments?: { image: string; alt: string }[]
  title: { en: string; vi: string }
  summary: { en: string; vi: string }
}

/** Public posts selected for the life timeline. Dates are the original post dates. */
export const lifeStories: LifeStory[] = [
  {
    id: 'camera-on',
    date: '2026-10-03',
    displayDate: '03 OCT 2026',
    kind: 'video',
    source: 'Facebook',
    sourceUrl: 'https://www.facebook.com/stories/2285337778144852/UzpfSVNDOjEwODA0NTQwMjQ4ODI2MTU=?view_single=false',
    image: '/images/life/facebook-camera-2026.jpg',
    imageAlt: 'Duy speaking to camera at his desk',
    video: '/videos/life/facebook-camera-2026.mp4',
    title: { en: 'Camera on, one take', vi: 'Bật máy quay, nói một lần' },
    summary: {
      en: 'A small experiment in talking to the camera, shared as a public Facebook Story.',
      vi: 'Một lần thử nói chuyện trước máy quay, chia sẻ bằng một Story Facebook công khai.',
    },
  },
  {
    id: 'soict-hackathon',
    date: '2023-10-29',
    displayDate: '28–29 OCT 2023',
    kind: 'photo', source: 'LinkedIn',
    sourceUrl: 'https://www.linkedin.com/in/leduy-it/overlay/Honor/490253241/treasury/',
    image: '/images/life/linkedin-soict-finalists-2023.jpeg',
    imageAlt: 'Finalists at the SoICT Hackathon 2023 closing event, shared in Duy’s LinkedIn award gallery',
    attachments: [{ image: '/images/life/linkedin-soict-certificate-2023.jpeg', alt: 'SoICT Hackathon 2023 certificate awarded to Le Van Duy' }],
    title: { en: 'A hackathon weekend', vi: 'Một cuối tuần hackathon' },
    summary: {
      en: 'The closing photo and my certificate from SoICT Hackathon 2023. Third prize in the Naver Vietnamese Handwritten Recognition track. Group photo: SoICT, HUST; saved from my LinkedIn award gallery.',
      vi: 'Ảnh chung kết và chứng nhận SoICT Hackathon 2023. Giải ba track nhận dạng chữ viết tay tiếng Việt của Naver. Ảnh tập thể: SoICT, HUST; lưu từ mục giải thưởng trên LinkedIn của mình.',
    },
  },
  {
    id: 'desk-evening',
    date: '2022-07-03',
    displayDate: '03 JUL 2022',
    kind: 'photo',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/leduy.py/p/CfitLXsBf-squnJWUGUzAvc5JYYBjc1TjMXkDc0/',
    image: '/images/life/instagram-desk-2022.jpg',
    imageAlt: 'Duy’s desk with a laptop, notebook, and candle',
    title: { en: 'An evening at the desk', vi: 'Một buổi tối bên bàn làm việc' },
    summary: {
      en: 'A laptop, notes, and a candle. An ordinary evening worth keeping.',
      vi: 'Laptop, sổ tay và một ngọn nến. Một buổi tối bình thường đáng để lưu lại.',
    },
  },
  {
    id: 'leaf-portrait',
    date: '2021-03-22',
    displayDate: '22 MAR 2021',
    kind: 'photo',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/leduy.py/p/CMtaLHVDN2cl0v4RWXFiLWn7GQTHZRr4IM7vGs0/',
    image: '/images/life/instagram-leaf-portrait-2021.jpg',
    imageAlt: 'Black-and-white portrait of Duy holding a leaf',
    title: { en: 'A leaf in the frame', vi: 'Một chiếc lá trong khung hình' },
    summary: {
      en: 'A black-and-white portrait, with a leaf held up to the light.',
      vi: 'Một bức chân dung đen trắng, với chiếc lá giơ lên trước ánh sáng.',
    },
  },
  {
    id: 'outside',
    date: '2021-02-03',
    displayDate: '03 FEB 2021',
    kind: 'photo',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/leduy.py/p/CK1m5CLnLvMHktTs96YV-gpTJeBhZy-A8J-WIc0/',
    image: '/images/life/instagram-outdoors-2021.jpg',
    imageAlt: 'Duy sitting by the water with mountains in the distance',
    title: { en: 'A day outside', vi: 'Một ngày ở ngoài trời' },
    summary: {
      en: 'A moment beside the water, with mountains beyond the shore.',
      vi: 'Một khoảnh khắc bên mặt nước, với núi ở phía xa.',
    },
  },
]

export type LifeHighlight = {
  id: string
  date: string
  source: 'Facebook' | 'Instagram'
  sourceUrl: string
  video: string
  poster: string
  title: { en: string; vi: string }
}

/** Short videos saved locally with their original audio tracks. */
export const lifeHighlights: LifeHighlight[] = [
  {
    id: 'fb-camera-2026', date: '2026-10-03', source: 'Facebook',
    sourceUrl: lifeStories[0].sourceUrl,
    video: '/videos/life/facebook-camera-2026.mp4',
    poster: '/images/life/facebook-camera-2026.jpg',
    title: { en: 'Camera on', vi: 'Bật máy quay' },
  },
  {
    id: 'ig-sunset-2023', date: '2023-08-08', source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/stories/highlights/18053458963681358/',
    video: '/videos/life/instagram-sunset-2023.mp4',
    poster: '/images/life/instagram-sunset-2023.jpg',
    title: { en: 'Come home', vi: 'Trở về' },
  },
  {
    id: 'ig-film-2023', date: '2023-04-18', source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/stories/highlights/17997459247819270/',
    video: '/videos/life/instagram-film-2023.mp4',
    poster: '/images/life/instagram-film-2023.jpg',
    title: { en: 'Behind the camera', vi: 'Sau ống kính' },
  },
  {
    id: 'ig-camera-2023', date: '2023-04-15', source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/stories/highlights/17997459247819270/',
    video: '/videos/life/instagram-camera-2023.mp4',
    poster: '/images/life/instagram-camera-2023.jpg',
    title: { en: 'Through the lens', vi: 'Qua ống kính' },
  },
  {
    id: 'ig-desk-2023', date: '2023-03-17', source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/stories/highlights/17963331088933710/',
    video: '/videos/life/instagram-desk-2023.mp4',
    poster: '/images/life/instagram-desk-2023.jpg',
    title: { en: 'End of the day', vi: 'Cuối ngày' },
  },
  {
    id: 'ig-architecture-2023', date: '2023-01-07', source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/stories/highlights/17988188236725595/',
    video: '/videos/life/instagram-architecture-2023.mp4',
    poster: '/images/life/instagram-architecture-2023.jpg',
    title: { en: 'Look up', vi: 'Nhìn lên' },
  },
  {
    id: 'ig-city-2022', date: '2022-12-13', source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/stories/highlights/17988188236725595/',
    video: '/videos/life/instagram-city-2022.mp4',
    poster: '/images/life/instagram-city-2022.jpg',
    title: { en: 'A view of the city', vi: 'Một góc thành phố' },
  },
]
