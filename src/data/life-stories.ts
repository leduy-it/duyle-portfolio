export type LifeStory = {
  id: string
  date: string
  displayDate: string
  kind: 'photo' | 'video' | 'external-video'
  source: 'Instagram' | 'Facebook'
  sourceUrl: string
  image?: string
  imageAlt?: string
  video?: string
  title: { en: string; vi: string }
  summary: { en: string; vi: string }
}

/** Public posts selected for the life timeline. Dates are the original post dates. */
export const lifeStories: LifeStory[] = [
  {
    id: 'camera-on',
    date: '2026-10-03',
    displayDate: '03 OCT 2026',
    kind: 'external-video',
    source: 'Facebook',
    sourceUrl: 'https://www.facebook.com/stories/2285337778144852/UzpfSVNDOjEwODA0NTQwMjQ4ODI2MTU=?view_single=false',
    title: { en: 'Camera on, one take', vi: 'Bật máy quay, nói một lần' },
    summary: {
      en: 'A small experiment in talking to the camera. A public Facebook Story from today.',
      vi: 'Một lần thử nói chuyện trước máy quay. Story Facebook công khai của hôm nay.',
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
