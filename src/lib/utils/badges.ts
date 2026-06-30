import type { BadgeDefinition } from '@/types';

export const BADGES: BadgeDefinition[] = [
  {
    key: 'first_prediction',
    icon: '🎯',
    label_ar: 'أول تنبؤ',
    label_en: 'First Prediction',
    description_ar: 'قدمت أول تنبؤ لك',
    description_en: 'Made your first prediction',
  },
  {
    key: 'first_correct',
    icon: '✅',
    label_ar: 'أول إصابة',
    label_en: 'First Correct',
    description_ar: 'أول تنبؤ صحيح لك',
    description_en: 'Got your first correct prediction',
  },
  {
    key: 'five_streak',
    icon: '🔥',
    label_ar: 'خمس إصابات متتالية',
    label_en: '5 in a Row',
    description_ar: '5 تنبؤات صحيحة متتالية',
    description_en: '5 correct predictions in a row',
  },
  {
    key: 'ten_winners',
    icon: '🏅',
    label_ar: 'عشر تنبؤات فائز',
    label_en: '10 Winner Predictions',
    description_ar: 'توقعت الفائز 10 مرات',
    description_en: 'Predicted the winner 10 times',
  },
  {
    key: 'leaderboard_1',
    icon: '🏆',
    label_ar: 'صدارة الترتيب',
    label_en: 'Leaderboard #1',
    description_ar: 'وصلت إلى المركز الأول',
    description_en: 'Reached #1 on the leaderboard',
  },
  {
    key: 'perfect_round',
    icon: '⭐',
    label_ar: 'جولة مثالية',
    label_en: 'Perfect Round',
    description_ar: 'أصبت جميع مباريات جولة',
    description_en: 'Got all matches correct in a round',
  },
  {
    key: 'top_weekly',
    icon: '📈',
    label_ar: 'الأعلى أسبوعياً',
    label_en: 'Top Weekly Score',
    description_ar: 'سجلت أعلى نقاط هذا الأسبوع',
    description_en: 'Highest score this week',
  },
];

export function getBadgeByKey(key: string): BadgeDefinition | undefined {
  return BADGES.find((b) => b.key === key);
}

