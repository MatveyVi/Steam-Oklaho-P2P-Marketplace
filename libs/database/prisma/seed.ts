import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Массив с данными для наполнения каталога
const itemsToSeed = [
  // Rifles (AK-47)
  {
    externalId: 'ak-47-redline',
    name: 'AK-47 | Redline',
    description: 'A classic rifle with a striking red and carbon fiber design.',
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20hPb6N7LflisB6MEp0u-V8dSm3Vbhrx1vYG-lJ4KScFA9Yw3Z-gW7wL_ug5O-7JSamHBk73BwtyzD30vgqA/360fx360f',
    rarity: 'Classified',
    quality: 'Field-Tested',
    type: 'Rifle',
    collection: 'Phoenix Collection',
  },
  {
    externalId: 'ak-47-case-hardened',
    name: 'AK-47 | Case Hardened',
    description:
      'More than a weapon, it is a conversation piece - an intricate pattern of colors.',
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5eSmjL-DlaP6NLS1wzIA7fp8j-3I4IG7ilfi-xprMDj3co-Rew4gIQvV_FG2kLy-jMC4tZ_N1zI/360fx360f',
    rarity: 'Classified',
    quality: 'Minimal Wear',
    type: 'Rifle',
    collection: 'CS:GO Weapon Case',
  },
  {
    externalId: 'ak-47-the-empress',
    name: 'AK-47 | The Empress',
    description: 'Wealth comes in many forms.',
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA4dG_lY-glPbmJ6Xfk3lu5Mx2gv2P8NmsiQ2y-hE_ZDr6d9fHdgA8Zg7W_1K8wurthpC07JSdn3Zl7yYksiaj30v2MQ/360fx360f',
    rarity: 'Covert',
    quality: 'Factory New',
    type: 'Rifle',
    collection: 'Spectrum 2 Case',
  },

  // Rifles (M4A4)
  {
    externalId: 'm4a4-howl',
    name: 'M4A4 | Howl',
    description: 'A very rare and controversial skin featuring a fiery wolf.',
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszYI2gS09-klY-glaD7N7f1xgRE7dN-jLyXpdjw2A3i-xY_Y23zIdeWJgM9ZFiF8wW5l7_uhJ66v5_KzXJjviUrty7D30v2DA/360fx360f',
    rarity: 'Contraband',
    quality: 'Factory New',
    type: 'Rifle',
    collection: 'Huntsman Weapon Case',
  },
  {
    externalId: 'm4a4-the-emperor',
    name: 'M4A4 | The Emperor',
    description: 'Lead with wisdom and strength.',
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszYI2gS08-jloy0hKGkZ7Lsd2EGuJJ5j9bJ8I_w0Azh-hE-ZDynctCWJAE9ZAzZ_lW5lLi7hJe0tJSan3FguCEksivD30u-uw/360fx360f',
    rarity: 'Covert',
    quality: 'Minimal Wear',
    type: 'Rifle',
    collection: 'Prisma Case',
  },

  // Rifles (AWP)
  {
    externalId: 'awp-dragon-lore',
    name: 'AWP | Dragon Lore',
    description: '200 keys and my soul is yours.',
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6r8FBRw7OfJYTh9_9K4momAgvL4P7LdqW5W6Zd0j-3E8I_wjg2y-hE4MD_7I4KSclI-PwzR-1i-x7vubpG_vJTNzXJhsD534m_D30vqMQ/360fx360f',
    rarity: 'Covert',
    quality: 'Factory New',
    type: 'Sniper Rifle',
    collection: 'Cobblestone Collection',
  },
  {
    externalId: 'awp-asiimov',
    name: 'AWP | Asiimov',
    description: 'A futuristic design popular among sci-fi fans.',
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6r8FBRw7P7NYjV9-N24q4KcqPv9NLPF2DlS-sR_j_St8nu5jFTh8xY_MDj2d9XAcw89ZFmF-wW7l7-90J6-tJ7KmiYm6HIk5HjD30vz6Q/360fx360f',
    rarity: 'Covert',
    quality: 'Field-Tested',
    type: 'Sniper Rifle',
    collection: 'Phoenix Collection',
  },
  {
    externalId: 'awp-gugnir',
    name: 'AWP | Gungnir',
    description: 'A weapon of choice for the gods of the battlefield.',
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6r8FBRw7ZTALDRK9M2_kL-Hl_L1DKjuhGBz_sNz3-2SpY3wiQPs-Bc6Zmv3I9OLcAA8ZAvZ_Vjox7_vjJW1tZzKzXFh7yIks2rD30v_5g/360fx360f',
    rarity: 'Covert',
    quality: 'Minimal Wear',
    type: 'Sniper Rifle',
    collection: 'Norse Collection',
  },

  // Pistols (Glock-18)
  {
    externalId: 'glock-18-fade',
    name: 'Glock-18 | Fade',
    description: "This isn't just a weapon, it's a statement.",
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovb34FBRp3_bJaDx96t2ykb-GlOTzJ6zsf2Nu5MtimuDGpY2k2VzhrRA_MDj2cNCSIQY6NVnV_FW9we-9h5C0tZzJzXFh7yYktHjD30v0Lg/360fx360f',
    rarity: 'Restricted',
    quality: 'Factory New',
    type: 'Pistol',
    collection: 'Assault Collection',
  },
  {
    externalId: 'glock-18-vogue',
    name: 'Glock-18 | Vogue',
    description: 'Look your best, play your best.',
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovb34FBRp3_bJaDx96t26k4S0h_b4ML6DxjJQ7MEh2L-WrdX03FXk-kVtMj-gdYOWIQI9Y1aG-AC4wO3vjZ_v7JSdn3Zl73Vw5j_D30uV5A/360fx360f',
    rarity: 'Classified',
    quality: 'Minimal Wear',
    type: 'Pistol',
    collection: 'Fracture Case',
  },

  // Pistols (USP-S)
  {
    externalId: 'usp-s-kill-confirmed',
    name: 'USP-S | Kill Confirmed',
    description: 'A fan favorite with an iconic design.',
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovb35a1p17dDacjB85N_nm4-ChfL4P7LdqW5W6Zd0j-3E8I_wjg2y-hA-Mmv3cYTEdlI7NFvV_lm3xOy9gcDvu5rJzXJhsD53-XjD30u5-w/360fx360f',
    rarity: 'Covert',
    quality: 'Field-Tested',
    type: 'Pistol',
    collection: 'Shadow Case',
  },
  {
    externalId: 'usp-s-neo-noir',
    name: 'USP-S | Neo-Noir',
    description: 'A stylish pistol for the discerning operative.',
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovb35a1p17dDacjB85t2yk7-DkP74DK_uhGBz_sNz3-2SotTwiwXs-hJsY2r6d9XAJAM5MgvY_1S8w--9jJ_pucnKzXFh7yYk-n_D30vR_Q/360fx360f',
    rarity: 'Covert',
    quality: 'Factory New',
    type: 'Pistol',
    collection: 'Danger Zone Case',
  },

  // Pistols (Desert Eagle)
  {
    externalId: 'deagle-blaze',
    name: 'Desert Eagle | Blaze',
    description: 'Engraved with a flame motif.',
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbX1BRs_7P_JRUgS4cyzlo-ChfL4P7LdqW5W6Zd0j-3E8I_wjg2y-hA6MGGmJdWWJgY3NQ7Q-QXvyu-7h5e5u5rJzXJhsD53vWvD30u7pg/360fx360f',
    rarity: 'Restricted',
    quality: 'Factory New',
    type: 'Pistol',
    collection: 'Dust Collection',
  },

  // SMGs
  {
    externalId: 'p90-asiimov',
    name: 'P90 | Asiimov',
    description:
      'The P90 is an iconic SMG, and the Asiimov skin is a perfect match.',
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpv-6m_Lg9f0v3YcyFN7c-jgL-GkvbiN-jTlDkGuMAl2LqV9433jVbkrkVsZDrzctOVdQA8ZwvQ_gK3kOu5h5e6u5rJzXJhsD533HjD30sFNA/360fx360f',
    rarity: 'Classified',
    quality: 'Minimal Wear',
    type: 'SMG',
    collection: 'Chroma 2 Case',
  },

  // Knives
  {
    externalId: 'karambit-doppler-p2',
    name: '★ Karambit | Doppler (Phase 2)',
    description: 'A curved knife with a cosmic pink and purple pattern.',
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsIWBzw8zEdg8f_tG3k4-cluPzPLfVl31D7dF5j9fP_Iv-gBq2rgE_Z2z1dI-TdVc-M1HV_gK9xLrtgJ_ptJSdn3Zl7yQktHfD30tH2g/360fx360f',
    rarity: 'Covert',
    quality: 'Factory New',
    type: 'Knife',
    collection: 'Chroma Case',
  },
  {
    externalId: 'm9-bayonet-lore',
    name: '★ M9 Bayonet | Lore',
    description: 'It has been custom painted with a knotwork design.',
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsIWFzw8zMdA8f7N-5j4SPhf6nN-jdlDwEupoq37iXoImi21Dk-0duZDmhd9SWcQdsNAnZ-gPsl7281sDvu5rJzXJhsD53u3vD30v55Q/360fx360f',
    rarity: 'Covert',
    quality: 'Minimal Wear',
    type: 'Knife',
    collection: 'Gamma Case',
  },
  {
    externalId: 'butterfly-knife-fade',
    name: '★ Butterfly Knife | Fade',
    description: 'A balisong, commonly known as a butterfly knife.',
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsIWFzw8zAZA4f_tW-mpScg_b4P7fVl31D7dF5j9fP_Iv-gBq2rgE_Z27yd4-WdVI5NF2E_AK4wOi-jZ7u7JSdn3Zl7yYksXjD30uQmg/360fx360f',
    rarity: 'Covert',
    quality: 'Factory New',
    type: 'Knife',
    collection: 'Breakout Case',
  },

  // Gloves
  {
    externalId: 'sport-gloves-vice',
    name: '★ Sport Gloves | Vice',
    description: 'Loud, vibrant, and ready for action.',
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovb35bHx20fX-bzJS_8i7kL-GkvPzNb-Dk25V-MZyj-3A4IG7iQ3i-kI-ZminiYnDcFY4YQ3V-FPvyu-8jJS4tZ_N1zI/360fx360f',
    rarity: 'Extraordinary',
    quality: 'Minimal Wear',
    type: 'Gloves',
    collection: 'Clutch Case',
  },
  {
    externalId: 'sport-gloves-pandoras-box',
    name: "★ Sport Gloves | Pandora's Box",
    description: 'A box of troubles is best left unopened.',
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovb35bHx20fX-bzJS_9i_m5aPhfPzPLzUhWNU7Md0j-3E8I_wjg2y-hE_Zmz0d9SVcANvYguB_1i_k7_uhpG5u5rJzXJhsD53wHmD30uW6A/360fx360f',
    rarity: 'Extraordinary',
    quality: 'Factory New',
    type: 'Gloves',
    collection: 'Hydra Case',
  },
  {
    externalId: 'specialist-gloves-crimson-kimono',
    name: '★ Specialist Gloves | Crimson Kimono',
    description: 'Subtle design, deadly precision.',
    imageUrl:
      'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovb35bHx10NTDbzBM_dGyl4mPlOTzIr7VlWpH8sB33u-W9I2k2Qey-RE_ZDqlJIeWIAY-YVrY_lW3xua-jMC4tZ_N1zI/360fx360f',
    rarity: 'Extraordinary',
    quality: 'Minimal Wear',
    type: 'Gloves',
    collection: 'Glove Case',
  },
];

async function main() {
  console.log('🌱 Start seeding catalog...');

  // Добавляем все предметы в базу данных
  await prisma.baseItem.createMany({
    data: itemsToSeed,
    skipDuplicates: true, // Пропускать предметы, если externalId уже существует
  });

  console.log(`✅ Seeding finished. ${itemsToSeed.length} items processed.`);
}

main()
  .catch((e) => {
    console.error('❌ An error occurred while seeding the database:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
