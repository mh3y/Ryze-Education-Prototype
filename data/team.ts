/**
 * Centralised team member data.
 *
 * Each page applies its own image optimisation strategy on top of the
 * base Cloudinary URLs exported here.
 */

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  atar: string;
  scores: string[];
  /** Base Cloudinary URL — pages may wrap with responsiveCloudinaryImage(). */
  imageUrl: string;
  fallbackUrl: string;
};

export const teamMembers: TeamMember[] = [
  {
    id: 'mike-nojiri',
    name: 'Mike Nojiri',
    role: "Master's in Teaching | BSc(Math)/BCompSc",
    atar: '99.25',
    scores: ['98 Maths Ext 2', '|', '99 Maths Ext 1', '99 Maths Advanced (Accelerated)'],
    imageUrl:
      'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_900,h_1125/v1769561928/869fcdd5dfa6efd8ee8853d9e0eea053_kiv4v2.jpg',
    fallbackUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'william-gong',
    name: 'William Gong',
    role: 'PhD - AI & Machine Learning candidate',
    atar: '99.50',
    scores: ['99 Maths Ext 2', '|', '97 Maths Ext 1', '|', '97 Physics', '94 Chemistry'],
    imageUrl:
      'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_900,h_1125/v1769568491/34b29c410f6278cf36653c984998c5fe_diuyma.jpg',
    fallbackUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'gordon-ye',
    name: 'Gordon Ye',
    role: 'UNSW Academic Teaching Staff | BMaths/BCompSc',
    atar: '99.55',
    scores: ['98 Maths Ext 2', '|', '98 Maths Ext 1', '|', '97 Physics', '96 Chemistry'],
    imageUrl:
      'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_900,h_1125/v1764460809/588278725_1528730215077629_8325133640910985831_n_mr2y31.jpg',
    fallbackUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
];

/**
 * Extended team data used only by MeetOurTeam page.
 * Michael Yang (founder) is not part of the teaching team displayed on Home / MathsTutoring.
 */
export type TeamMemberExtended = TeamMember & {
  roleShort: string;
  bio?: string;
  wordsFromFounder?: string;
};
