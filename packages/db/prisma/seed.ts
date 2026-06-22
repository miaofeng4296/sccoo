import { prisma } from '../src';
import { hashSync } from 'bcryptjs';

async function main() {
  console.log('Seeding database...');

  // Create provinces and cities
  const provinces = [
    { name: '直辖市', slug: 'zhixiashi', cities: [
      { name: '北京', subdomain: 'beijing' }, { name: '上海', subdomain: 'shanghai' },
      { name: '天津', subdomain: 'tianjin' }, { name: '重庆', subdomain: 'chongqing' },
    ]},
    { name: '山东', slug: 'shandong', cities: [
      { name: '济南', subdomain: 'jinan' }, { name: '青岛', subdomain: 'qingdao' },
    ]},
    { name: '江苏', slug: 'jiangsu', cities: [
      { name: '南京', subdomain: 'nanjing' }, { name: '苏州', subdomain: 'suzhou' },
    ]},
    { name: '浙江', slug: 'zhejiang', cities: [
      { name: '杭州', subdomain: 'hangzhou' }, { name: '宁波', subdomain: 'ningbo' },
    ]},
    { name: '广东', slug: 'guangdong', cities: [
      { name: '广州', subdomain: 'guangzhou' }, { name: '深圳', subdomain: 'shenzhen' },
      { name: '东莞', subdomain: 'dongguan' },
    ]},
    { name: '湖南', slug: 'hunan', cities: [
      { name: '长沙', subdomain: 'changsha' }, { name: '岳阳', subdomain: 'yueyang' },
    ]},
    { name: '湖北', slug: 'hubei', cities: [{ name: '武汉', subdomain: 'wuhan' }]},
    { name: '四川', slug: 'sichuan', cities: [{ name: '成都', subdomain: 'chengdu' }]},
  ];

  const cityMap: Record<string, number> = {};

  for (const prov of provinces) {
    const sub = 'prov-' + prov.slug;
    const parent = await prisma.city.create({
      data: { name: prov.name, slug: prov.slug, subdomain: sub, isActive: true },
    });
    for (const city of prov.cities) {
      const c = await prisma.city.create({
        data: { name: city.name, slug: city.subdomain, subdomain: city.subdomain, parentId: parent.id, isActive: true },
      });
      cityMap[city.subdomain] = c.id;
    }
  }

  // Create categories
  const postCategories = [
    { name: '我行我秀', slug: 'show' },
    { name: '我要招聘', slug: 'job' },
    { name: '我要求职', slug: 'seek' },
    { name: '纹身店转让', slug: 'shop-transfer' },
    { name: '纹身模特', slug: 'model' },
    { name: '预约纹身', slug: 'booking' },
    { name: '纹身培训', slug: 'training' },
    { name: '二手设备转让', slug: 'secondhand' },
    { name: '周边服务', slug: 'service' },
  ];

  const catMap: Record<string, number> = {};
  for (let i = 0; i < postCategories.length; i++) {
    const cat = await prisma.category.create({
      data: { ...postCategories[i]!, sortOrder: i },
    });
    catMap[postCategories[i]!.slug] = cat.id;
  }

  // Create article categories
  const articleCategories = [
    { name: '本站公告', slug: 'announcement', sortOrder: 0 },
    { name: '纹身知识', slug: 'knowledge', sortOrder: 1 },
    { name: '纹身趣闻', slug: 'fun', sortOrder: 2 },
    { name: '纹身大师', slug: 'master', sortOrder: 3 },
  ];

  const artCatIds: number[] = [];
  for (const ac of articleCategories) {
    const c = await prisma.category.create({ data: ac });
    artCatIds.push(c.id);
  }

  // Create users
  const pw = hashSync('123456', 10);

  const admin = await prisma.user.create({
    data: { email: 'admin@sccoo.cn', name: '管理员', role: 'ADMIN', passwordHash: pw },
  });

  const user1 = await prisma.user.create({
    data: { email: 'artist1@test.com', name: '纹身师小王', passwordHash: pw },
  });

  const user2 = await prisma.user.create({
    data: { email: 'shop1@test.com', name: '烈火堂纹身', passwordHash: pw },
  });

  // Create businesses
  const biz1 = await prisma.business.create({
    data: { userId: user2.id, name: '烈火堂纹身机构', phone: '13355313500', address: '济南市历下区', cityId: cityMap['jinan']!, description: '山东老牌纹身机构，专注传统纹身20年', isVerified: true },
  });

  const biz2 = await prisma.business.create({
    data: { userId: admin.id, name: '岳阳新刺客', phone: '18182001713', address: '岳阳市岳阳楼区', cityId: cityMap['yueyang']!, description: '岳阳最专业的纹身工作室', isVerified: true },
  });

  const biz3 = await prisma.business.create({
    data: { userId: user2.id, name: '深圳8度纹身', phone: '13800000000', address: '深圳市福田区', cityId: cityMap['shenzhen']!, description: '10年老店，位于市中心', isVerified: true },
  });

  // Create sample posts
  const samplePosts = [
    { title: '山西太原老牌纹身店高薪诚聘成熟纹身师', content: '要求3年以上经验，擅长新老传统风格，月薪8000-20000，提供住宿', type: 'JOB', categoryId: catMap['job']!, cityId: cityMap['jinan']!, priceMin: 8000, priceMax: 20000, isPinned: true, pinType: 'LARGE_TOP' },
    { title: '成都招聘纹身师 可接受初级纹身师', content: '招师傅，可接受初级纹身师，包天走量，活多事少，月薪8000-15000', type: 'JOB', categoryId: catMap['job']!, cityId: cityMap['chengdu']!, priceMin: 8000, priceMax: 15000, isPinned: true, pinType: 'LARGE_TOP' },
    { title: '昆明招聘纹身师薪资1万以上', content: '昆明招聘纹身师，要求能独立完成作品，保底1万，提成另算', type: 'JOB', categoryId: catMap['job']!, cityId: cityMap['hangzhou']!, priceMin: 8000, priceMax: 50000, isPinned: true, pinType: 'LARGE_TOP' },
    { title: '广州佛山急招两名驻店纹身师', content: '广州佛山急招驻店纹身师2名，本地附近同行纹身师均可兼职合作', type: 'JOB', categoryId: catMap['job']!, cityId: cityMap['guangzhou']!, priceMin: 8000, priceMax: 20000, isPinned: true, pinType: 'MEDIUM_TOP' },
    { title: '纹身师求职驻店', content: '从业4年，擅长老传统风格，想找武汉的纹身店驻店，月薪7000以上即可', type: 'SEEK', categoryId: catMap['seek']!, cityId: cityMap['wuhan']!, priceMin: 7000, priceMax: 7000, isPinned: true, pinType: 'SMALL_TOP' },
    { title: '苏州招聘纹身师月薪1.2万以上', content: '苏州纹身店招聘成手驻店师傅，要求擅长老传统，线条扎实，包吃住', type: 'JOB', categoryId: catMap['job']!, cityId: cityMap['suzhou']!, priceMin: 12000, priceMax: 20000, isPinned: true, pinType: 'SMALL_TOP' },
    { title: '山东走量店招实习纹身师', content: '青岛走量店招聘实习纹身师，能接受走量店的经营模式，月薪3000-12000', type: 'JOB', categoryId: catMap['job']!, cityId: cityMap['qingdao']!, priceMin: 3000, priceMax: 12000, isPinned: true, pinType: 'SMALL_TOP' },
    { title: '纹身店转让 - 北京朝阳区', content: '朝阳区成熟纹身店转让，面积80平，设备齐全，客源稳定，转让费面议', type: 'SHOP_TRANSFER', categoryId: catMap['shop-transfer']!, cityId: cityMap['beijing']!, priceMin: 50000, priceMax: 100000, isPinned: true, pinType: 'MEDIUM_TOP' },
    { title: '专业纹身培训 包教包会', content: '长沙纹身培训学校招生，一对一教学，提供练习皮和设备，3个月出师', type: 'TRAINING', categoryId: catMap['training']!, cityId: cityMap['changsha']!, priceMin: 3000, priceMax: 8000, isPinned: true, pinType: 'LARGE_TOP' },
    { title: '转让纹身机套装 九成新', content: '转让一套纹身机套装，含马达机、电源、脚踏、色料等，几乎全新', type: 'SECONDHAND', categoryId: catMap['secondhand']!, cityId: cityMap['shenzhen']!, priceMin: 800, priceMax: 1500 },
    { title: '南京纹身模特招募', content: '新传统风格作品需要模特，包设计费只收材料费，要求满18岁', type: 'MODEL', categoryId: catMap['model']!, cityId: cityMap['nanjing']! },
    { title: '预约纹身 - 花臂满背', content: '想做一条花臂和满背，传统日式风格，求推荐靠谱纹身师，预算充足', type: 'BOOKING', categoryId: catMap['booking']!, cityId: cityMap['shanghai']! },
    { title: '重庆纹身店招驻店纹身师', content: '重庆观音桥纹身店招聘驻店师傅2名，新店开业客源充足，5-5分成', type: 'JOB', categoryId: catMap['job']!, cityId: cityMap['chongqing']!, priceMin: 10000, priceMax: 20000 },
    { title: '深圳招聘老传统熟手师傅', content: '深圳8度纹身总店，10年老店，位于中心地段，招聘老传统熟手师傅', type: 'JOB', categoryId: catMap['job']!, cityId: cityMap['shenzhen']!, priceMin: 9000, priceMax: 15000 },
    { title: '东莞招1-8年师傅', content: '东莞诚招驻店，要求擅长老传统风格，有速有质，月薪8000-20000', type: 'JOB', categoryId: catMap['job']!, cityId: cityMap['dongguan']!, priceMin: 8000, priceMax: 20000 },
  ];

  const now = new Date();
  for (const p of samplePosts) {
    await prisma.post.create({
      data: {
        ...p,
        userId: user1.id,
        status: 'PUBLISHED',
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        pinExpiresAt: p.isPinned ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) : null,
      },
    });
  }

  // Create sample articles
  const articles = [
    { title: '赶快进每个省的纹身师群（优质群）', content: '为了方便每个省的纹身店、纹身师相互交流，秀酷纹身之家整合全网纹身师资源，邀请全国纹身师入群...', categoryId: artCatIds[0]!, isPublished: true, author: '管理员' },
    { title: '[纹身知识]如何区分不同的菩萨纹身手稿？', content: '菩萨纹身在纹身中非常常见，不同的菩萨代表不同的含义，本文将详细介绍如何区分...', categoryId: artCatIds[1]!, isPublished: true, author: '纹身大师' },
    { title: '[本站公告]2020年关于百度对新站收录问题的研究', content: '百度搜索引擎对新网站的收录策略有所调整，本文将分享一些优化建议...', categoryId: artCatIds[0]!, isPublished: true, author: '管理员' },
    { title: '[纹身知识]洗纹身多少钱', content: '洗纹身的价格因纹身大小、颜色、位置等因素而异，一般来说...', categoryId: artCatIds[1]!, isPublished: true, author: '纹身百科' },
    { title: '[纹身趣闻]九龙拉棺纹身含义', content: '九龙拉棺是近年来非常流行的纹身图案，背后蕴含着丰富的文化内涵...', categoryId: artCatIds[2]!, isPublished: true, author: '纹身趣闻' },
    { title: '[纹身趣闻]纹身师三不纹', content: '纹身师有三不纹：不纹未成年人、不纹醉酒者、不纹身份不明者...', categoryId: artCatIds[2]!, isPublished: true, author: '行业规范' },
  ];

  for (const a of articles) {
    await prisma.article.create({ data: a });
  }

  // Create QA questions and answers
  const q1 = await prisma.qaQuestion.create({
    data: { title: '新手学纹身应该从哪里开始？', content: '我完全没有美术基础，想学纹身，不知道从哪里入门比较好？需要先学画画吗？去哪里学习比较正规？', userId: user1.id, viewCount: 1560, answerCount: 2, isResolved: true },
  });
  await prisma.qaAnswer.create({ data: { questionId: q1.id, content: '建议先从基础素描开始学起，至少要掌握基本的线条和明暗关系。然后可以找一个正规的纹身培训机构或者拜师学艺。推荐去大型纹身店当学徒，虽然前几个月没有收入，但能学到真功夫。', userId: admin.id, isAccepted: true } });
  await prisma.qaAnswer.create({ data: { questionId: q1.id, content: '美术基础确实很重要，但不是必须从专业绘画学起。你可以先在网上看免费教程，练习画简单的图案。同时可以找当地的纹身店问问能不能当学徒。', userId: user2.id } });

  const q2 = await prisma.qaQuestion.create({
    data: { title: '纹身店转让需要注意什么？', content: '我看中了一家正在转让的纹身店，想问下接手之前需要检查哪些东西？怎么判断客源是否真实？转让合同要注意什么？', userId: user2.id, viewCount: 892, answerCount: 1 },
  });
  await prisma.qaAnswer.create({ data: { questionId: q2.id, content: '1. 一定要查店铺的营业执照、卫生许可证是否在有效期内；2. 要求查看近6个月的营业流水和客源记录；3. 确认租赁合同剩余年限和租金涨幅条款；4. 设备清单要逐项核对；5. 最好在转让合同里约定前店主半年内不得在附近开店。', userId: admin.id, isAccepted: true } });

  const q3 = await prisma.qaQuestion.create({
    data: { title: '纹身恢复期间可以喝酒吗？', content: '刚纹完身第三天，朋友约喝酒，请问可以喝吗？会不会影响纹身恢复？', userId: user1.id, viewCount: 3200, answerCount: 3, isResolved: true },
  });
  await prisma.qaAnswer.create({ data: { questionId: q3.id, content: '绝对不可以！纹身恢复期间（至少2周内）禁止饮酒。酒精会扩张血管，导致纹身部位出血增多，色素可能被冲淡，严重影响纹身效果。还会延缓伤口愈合。', userId: admin.id, isAccepted: true } });
  await prisma.qaAnswer.create({ data: { questionId: q3.id, content: '补充一点：除了不能喝酒，还要避免辛辣食物、海鲜等发物，保持纹身部位清洁干燥，按时涂抹修复膏。', userId: user2.id } });

  const q4 = await prisma.qaQuestion.create({
    data: { title: '纹身师一般月收入多少？', content: '我想转行做纹身师，但不知道这个行业收入怎么样？驻店和自开店的区别大吗？', userId: user2.id, viewCount: 4500, answerCount: 2 },
  });
  await prisma.qaAnswer.create({ data: { questionId: q4.id, content: '驻店纹身师收入差别很大：新手期（1-2年）月收入3000-8000，成熟期（3-5年）8000-20000，资深师傅（5年以上）20000-50000+。自开店的话前期投入大，但盈利空间也更大，做好了月入10万不是问题。关键还是要看技术水平和客源。', userId: admin.id } });
  await prisma.qaAnswer.create({ data: { questionId: q4.id, content: '我说点实在的：这个行业两极分化严重。技术好、会营销的师傅赚得多，但也有很多纹身师月薪不到5000。建议先当2-3年学徒，把技术练好再说收入。', userId: user1.id } });

  const q5 = await prisma.qaQuestion.create({
    data: { title: '遮盖旧纹身需要多少钱？', content: '手臂上有个10cm左右的旧纹身想遮盖掉，大概需要多少钱？有什么注意事项？', userId: user1.id, viewCount: 2100, answerCount: 1, isResolved: true },
  });
  await prisma.qaAnswer.create({ data: { questionId: q5.id, content: '遮盖纹身通常比新纹身贵30%-100%，10cm的旧纹身遮盖费用一般在1500-5000元之间，具体看图案复杂度和遮盖难度。注意事项：1. 不是所有纹身都能完美遮盖，深色旧图需要更大的深色区域；2. 遮盖通常需要比原图大2-3倍；3. 建议先咨询有遮盖经验的师傅，看看是否可行。', userId: admin.id, isAccepted: true } });

  // Create banners
  await prisma.banner.create({ data: { title: '纹身店线上获客', imageUrl: '/banners/banner1.jpg', linkUrl: '/xinxi/', sortOrder: 0 } });
  await prisma.banner.create({ data: { title: '加入纹身师微信群', imageUrl: '/banners/banner2.jpg', linkUrl: '/about/join', sortOrder: 1 } });

  console.log('Seed data created successfully!');
  console.log('Admin login: admin@sccoo.cn / 123456');
  console.log('User login: artist1@test.com / 123456');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
