import { prisma } from '../src';

async function main() {
  // 创建省份和城市
  const provinces = [
    { name: '直辖市', slug: 'zhixiashi', cities: [
      { name: '北京', subdomain: 'beijing' },
      { name: '上海', subdomain: 'shanghai' },
      { name: '天津', subdomain: 'tianjin' },
      { name: '重庆', subdomain: 'chongqing' },
    ]},
    { name: '山东', slug: 'shandong', cities: [
      { name: '济南', subdomain: 'jinan' },
      { name: '青岛', subdomain: 'qingdao' },
    ]},
    { name: '江苏', slug: 'jiangsu', cities: [
      { name: '南京', subdomain: 'nanjing' },
      { name: '苏州', subdomain: 'suzhou' },
    ]},
    { name: '浙江', slug: 'zhejiang', cities: [
      { name: '杭州', subdomain: 'hangzhou' },
      { name: '宁波', subdomain: 'ningbo' },
    ]},
    { name: '广东', slug: 'guangdong', cities: [
      { name: '广州', subdomain: 'guangzhou' },
      { name: '深圳', subdomain: 'shenzhen' },
      { name: '东莞', subdomain: 'dongguan' },
    ]},
    { name: '湖南', slug: 'hunan', cities: [
      { name: '长沙', subdomain: 'changsha' },
      { name: '岳阳', subdomain: 'yueyang' },
    ]},
    { name: '湖北', slug: 'hubei', cities: [
      { name: '武汉', subdomain: 'wuhan' },
    ]},
    { name: '四川', slug: 'sichuan', cities: [
      { name: '成都', subdomain: 'chengdu' },
    ]},
  ];

  for (const prov of provinces) {
    const parent = await prisma.city.create({
      data: { name: prov.name, slug: prov.slug, subdomain: prov.slug, isActive: true },
    });
    for (const city of prov.cities) {
      await prisma.city.create({
        data: { name: city.name, slug: city.subdomain, subdomain: city.subdomain, parentId: parent.id, isActive: true },
      });
    }
  }

  // 创建分类
  const categories = [
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

  for (let i = 0; i < categories.length; i++) {
    await prisma.category.create({
      data: { ...categories[i]!, sortOrder: i },
    });
  }

  // 创建文章分类
  const articleCategories = [
    { name: '本站公告', slug: 'announcement', sortOrder: 0 },
    { name: '纹身知识', slug: 'knowledge', sortOrder: 1 },
    { name: '纹身趣闻', slug: 'fun', sortOrder: 2 },
    { name: '纹身大师', slug: 'master', sortOrder: 3 },
  ];

  for (const ac of articleCategories) {
    await prisma.category.create({ data: ac });
  }

  // 创建管理员
  await prisma.user.create({
    data: {
      email: 'admin@sccoo.cn',
      name: '管理员',
      role: 'ADMIN',
      passwordHash: 'CHANGE_ME',
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
