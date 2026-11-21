import { APP_NAME } from '@/constants/brand';
import type { PhotoName } from './photos';
import { getPlace, samplePostcards, type SamplePostcard } from './sample';

/**
 * Postcards (the app's word for notifications, product rule 4) as digital postcards: a photo on
 * the front, and a message on the back. Sample content for now; real Postcards between friends
 * come with friends (plan Step 3).
 */
export type Postcard = SamplePostcard & {
  id: string;
  /** Who it's from, as shown ("Tom", or the app). */
  from: string;
  /** The line in the Postcards list. */
  line: string;
  /** Where the front photo is from ("Kyoto"). */
  place: string;
  /** The handwritten message on the back ("Dear …" is added with your name). */
  message: string;
  /** Photos they sent; the first is the front. */
  photos: PhotoName[];
  /** A score they gave, shown in a stamp. */
  score: number | null;
  signoff: string;
};

const withApp = (s: string) => s.replace(/XYZX/g, APP_NAME);

// The backs of the sample postcards, in the same order as samplePostcards.
const BACKS: { message: string; photos: PhotoName[]; score: number | null; signoff: string }[] = [
  {
    message: 'Kyoto is on your list, so you have to go. Spring for the blossom, and get up early for Fushimi Inari before the crowds. Best trip I’ve had in years.',
    photos: ['kyoto-1', 'kyoto-2', 'kaiseki-1'],
    score: 9.5,
    signoff: 'Tom x',
  },
  {
    message: 'Wish you were here! We had the kaiseki dinner last night (twelve courses, I’ve never been so full) and walked home through Gion in the lanterns.',
    photos: ['kyoto-2', 'kaiseki-1', 'kyoto-1'],
    score: null,
    signoff: 'Love, Tom',
  },
  {
    message: 'The villa you saved is even better in real life. Ask for the room with the lemon terrace, and have breakfast out there every morning.',
    photos: ['lemon-1', 'villa-1', 'positano-1'],
    score: 9.0,
    signoff: 'Priya x',
  },
  {
    message: 'Saw the Maldives on your Want to go list. Do it! The sandbank dinner was the best night of the whole trip, just us and the stars.',
    photos: ['maldives-1', 'maldives-2'],
    score: 9.4,
    signoff: 'Maya x',
  },
  {
    message: 'Polignano a Mare is trending this month, and two of your friends went this autumn. Swim at Lama Monachile and stay for the sunset.',
    photos: ['puglia-1', 'puglia-2'],
    score: null,
    signoff: `From all of us at ${APP_NAME}`,
  },
  {
    message: 'Four of us have been to Hydra now. No cars, just donkeys and swimming off the rocks. It’s a 9.1 for you, so it’s time!',
    photos: ['hydra-1', 'hydra-2'],
    score: 9.4,
    signoff: 'Maya x',
  },
  {
    message: `Hello! I’ve just joined ${APP_NAME}, so now we can see each other’s trips. Can’t wait to see where you’ve been.`,
    photos: ['deia-1'],
    score: null,
    signoff: 'Jonah',
  },
];

export const postcards: Postcard[] = samplePostcards.map((p, i) => {
  const back = BACKS[i] ?? { message: withApp(p.text), photos: p.photo ? [p.photo] : [], score: null, signoff: p.who };
  const photos = back.photos.length ? back.photos : p.photo ? [p.photo] : [];
  return {
    ...p,
    ...back,
    id: String(i),
    photos,
    from: withApp(p.who),
    line: withApp(p.text),
    place: getPlace(p.slug)?.name ?? '',
  };
});

export const getPostcard = (id: string) => postcards.find((p) => p.id === id) ?? null;
