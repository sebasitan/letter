import { supabase } from './supabase'

// ============================================================
// DEFAULTS — the current catalog. Used as a fallback when the DB
// is empty/unreachable, and as the seed source for "Import defaults".
// ============================================================

export const DEFAULT_LETTERS = [
  {
    slug: 'love', name: 'Love Letter', price: 499, image: '/images/love.png', emoji: '❤️',
    is_bestseller: false, sort_order: 1,
    description: 'Confession, anniversary, distance, or a proposal worth remembering forever.',
    tagline: "Pour your heart out — we'll turn it into words they'll keep forever.",
    recipient_label: "Who's your special someone?",
    prompt: 'How did you meet? What do you love most about them? A moment you both treasure?',
    placeholder: "Tell us your story — how you met, what you adore about them, the little inside jokes, a memory that defines you two...",
    occasions: ['Anniversary', 'Proposal', 'Confession', 'Long distance', 'Just because'],
    tones: ['Warm & Loving', 'Poetic & Romantic', 'Playful & Fun', 'Deep & Heartfelt'],
    accent: { tint: '#FBE3DB', icon: '#B5593A', border: '#E2A18E', glow: 'rgba(181,89,58,0.25)' },
  },
  {
    slug: 'healing', name: 'Healing / Breakup Letter', price: 599, image: '/images/healing.png', emoji: '🩹',
    is_bestseller: false, sort_order: 2,
    description: 'Goodbye, closure, forgiveness, moving on — the words you need to say.',
    tagline: "Say what's been weighing on you. We'll help you find the words for closure.",
    recipient_label: 'Who is this letter for?',
    prompt: 'What do you need to say or release? What would closure feel like for you?',
    placeholder: "Share what's on your heart — what you need to let go of, forgive, or finally say. There's no wrong way to feel.",
    occasions: ['Goodbye', 'Closure', 'Forgiveness', 'Moving on', 'Letting go'],
    tones: ['Gentle & Kind', 'Honest & Raw', 'Calm & Reflective', 'Forgiving'],
    accent: { tint: '#E0ECE2', icon: '#5E7E66', border: '#A6C1AD', glow: 'rgba(94,126,102,0.25)' },
  },
  {
    slug: 'birthday', name: 'Birthday Letter', price: 399, image: '/images/birthday-letter.png', emoji: '🎂',
    is_bestseller: false, sort_order: 3,
    description: 'Parents to child, best friend, or a milestone birthday made unforgettable.',
    tagline: 'Make their day unforgettable with words written just for them.',
    recipient_label: 'Whose birthday is it?',
    prompt: 'What makes them special? A favourite memory, an inside joke, your wish for them?',
    placeholder: 'Tell us about them — what you admire, a memory that makes you smile, what you wish for them this year...',
    occasions: ['Milestone birthday', 'For a parent', 'For a child', 'For a best friend', 'Surprise'],
    tones: ['Joyful & Celebratory', 'Warm & Heartfelt', 'Funny & Playful', 'Sentimental'],
    accent: { tint: '#FAE7C6', icon: '#B98A1E', border: '#E0C275', glow: 'rgba(196,154,46,0.28)' },
  },
  {
    slug: 'apology', name: 'Apology Letter', price: 499, image: '/images/apology.png', emoji: '💬',
    is_bestseller: false, sort_order: 4,
    description: 'Sorry to a partner, family, or an old friend — sincerity, beautifully written.',
    tagline: 'Some things are hard to say. Let us help you say sorry, sincerely.',
    recipient_label: 'Who do you want to apologise to?',
    prompt: 'What happened? What do you wish you could take back? How do you want to make it right?',
    placeholder: "Tell us honestly — what you're sorry for, what they mean to you, and how you hope to make things right.",
    occasions: ['To a partner', 'To family', 'To a friend', 'Rebuilding trust', 'Making amends'],
    tones: ['Sincere & Humble', 'Heartfelt & Honest', 'Gentle', 'Earnest'],
    accent: { tint: '#E1E8F0', icon: '#51708C', border: '#A6BCD0', glow: 'rgba(81,112,140,0.25)' },
  },
  {
    slug: 'family', name: 'Family Letter', price: 599, image: '/images/family.png', emoji: '👨‍👩‍👧',
    is_bestseller: false, sort_order: 5,
    description: "Newborn, leaving home, Mother's Day, Father's Day — for the people who raised you.",
    tagline: "For the people who raised you, or the ones you're raising — words that last generations.",
    recipient_label: 'Who is this letter for?',
    prompt: 'What do they mean to you? A lesson they taught you, a memory, a hope for the future?',
    placeholder: "Share what's in your heart — the lessons, the memories, the gratitude you've never quite put into words.",
    occasions: ['Newborn / Time capsule', 'Leaving home', "Mother's Day", "Father's Day", 'Gratitude'],
    tones: ['Warm & Grateful', 'Nostalgic', 'Loving & Tender', 'Heartfelt'],
    accent: { tint: '#FBE4D2', icon: '#BE7048', border: '#E3B493', glow: 'rgba(190,112,72,0.25)' },
  },
  {
    slug: 'mystery', name: 'Mystery Box', price: 1099, image: '/images/mystery.png', emoji: '🎁',
    is_bestseller: true, sort_order: 6,
    description: 'We write the letter AND choose the gift. A total surprise, curated for them.',
    tagline: "Tell us about them — we'll write the letter AND choose the perfect gift.",
    recipient_label: 'Who is the surprise for?',
    prompt: 'Tell us about them so we can curate the perfect gift — their personality, interests, what makes them light up.',
    placeholder: 'Describe them — what they love, their style, hobbies, favourite things, and the feeling you want to give them.',
    occasions: ['Surprise', 'Celebration', 'Thinking of you', 'Special occasion', 'Just because'],
    tones: ['Warm & Loving', 'Playful & Fun', 'Elegant & Thoughtful', 'Surprise me'],
    accent: null,
  },
]

export const DEFAULT_GIFTS = [
  { id: 'dried-flowers', name: 'Dried Flower Bouquet', description: 'Preserved blooms', price: 399, emoji: '🌸', image: '/images/gifts/dried-flowers.png', personalised: false, sort_order: 1 },
  { id: 'candle', name: 'Scented Soy Candle', description: 'Warm vanilla glow', price: 349, emoji: '🕯️', image: '/images/gifts/candle.png', personalised: false, sort_order: 2 },
  { id: 'chocolates', name: 'Premium Chocolates', description: 'Handpicked box', price: 299, emoji: '🍫', image: '/images/gifts/chocolates.png', personalised: false, sort_order: 3 },
  { id: 'succulent', name: 'Mini Succulent', description: 'A living keepsake', price: 249, emoji: '🪴', image: '/images/gifts/succulent.png', personalised: false, sort_order: 4 },
  { id: 'photo-frame', name: 'Photo Frame', description: 'Personalised • your photo framed', price: 499, emoji: '🖼️', image: '/images/gifts/photo-frame.png', personalised: true, sort_order: 5 },
  { id: 'keychain', name: 'Name Keychain', description: 'Personalised • engraved name', price: 199, emoji: '🔑', image: '/images/gifts/keychain.png', personalised: true, sort_order: 6 },
  { id: 'bracelet', name: 'Minimalist Bracelet', description: 'Dainty & elegant', price: 399, emoji: '📿', image: '/images/gifts/bracelet.png', personalised: false, sort_order: 7 },
  { id: 'song-plaque', name: 'Song Plaque', description: 'Personalised • scan to play', price: 449, emoji: '🎵', image: '/images/gifts/song-plaque.png', personalised: true, sort_order: 8 },
]

export const DEFAULT_PAPERS = [
  { id: 'parchment', name: 'Classic Parchment', description: 'Warm aged tone', price: 0, bg: '#F4E6CE', sort_order: 1 },
  { id: 'ivory', name: 'Ivory Cotton', description: 'Smooth & premium', price: 49, bg: '#FBF6EC', sort_order: 2 },
  { id: 'textured', name: 'Handmade Textured', description: 'Artisan deckle edge', price: 99, bg: '#EFE3CE', sort_order: 3 },
  { id: 'vintage', name: 'Aged Vintage', description: 'Tea-stained look', price: 99, bg: '#E7D3AE', sort_order: 4 },
]

export const DEFAULT_INKS = [
  { id: 'black', name: 'Classic Black', hex: '#2B2B2B', price: 0, sort_order: 1 },
  { id: 'sepia', name: 'Sepia Brown', hex: '#5C3A2E', price: 0, sort_order: 2 },
  { id: 'blue', name: 'Royal Blue', hex: '#1E3A8A', price: 0, sort_order: 3 },
  { id: 'burgundy', name: 'Burgundy', hex: '#7A1F2B', price: 0, sort_order: 4 },
  { id: 'emerald', name: 'Emerald', hex: '#1F5C46', price: 0, sort_order: 5 },
  { id: 'gold', name: 'Gold (metallic)', hex: '#B8860B', price: 49, sort_order: 6 },
]

export const DEFAULT_TIERS = [
  { id: 'gentle', name: 'Gentle', description: 'Warm words of comfort', price: 249, sort_order: 1 },
  { id: 'warm', name: 'Warm', description: 'Emotional & heartfelt', price: 499, sort_order: 2 },
  { id: 'luxe', name: 'Luxe', description: 'Premium paper & ink', price: 999, sort_order: 3 },
]

const TABLE_DEFAULTS = {
  letter_types: DEFAULT_LETTERS,
  gifts: DEFAULT_GIFTS,
  paper_types: DEFAULT_PAPERS,
  ink_colors: DEFAULT_INKS,
  gift_tiers: DEFAULT_TIERS,
}

// ── Public fetch: active rows, sorted; falls back to defaults ──
async function fetchActive(table, defaults) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    if (error || !data || data.length === 0) return defaults
    return data
  } catch {
    return defaults
  }
}

export async function fetchCatalog() {
  const [letters, gifts, papers, inks, tiers] = await Promise.all([
    fetchActive('letter_types', DEFAULT_LETTERS),
    fetchActive('gifts', DEFAULT_GIFTS),
    fetchActive('paper_types', DEFAULT_PAPERS),
    fetchActive('ink_colors', DEFAULT_INKS),
    fetchActive('gift_tiers', DEFAULT_TIERS),
  ])
  return { letters, gifts, papers, inks, tiers }
}

// ── Admin: read ALL rows (incl inactive) ──
export async function adminFetch(table) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

export async function adminUpsert(table, row) {
  const { error } = await supabase.from(table).upsert(row)
  if (error) throw error
  return true
}

export async function adminDelete(table, idField, idValue) {
  const { error } = await supabase.from(table).delete().eq(idField, idValue)
  if (error) throw error
  return true
}

// ── Seed defaults into a table (only used by admin "Import defaults") ──
export async function seedTable(table) {
  const { error } = await supabase.from(table).upsert(TABLE_DEFAULTS[table])
  if (error) throw error
  return true
}
