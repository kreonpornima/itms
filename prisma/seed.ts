import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const agentHash = await bcrypt.hash('Agent@123', 10);
  const userHash = await bcrypt.hash('User@123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@itms.local',
      passwordHash: adminHash,
      fullName: 'System Admin',
      role: 'ADMIN',
      department: 'IT',
    },
  });

  const agent1 = await prisma.user.upsert({
    where: { username: 'rahul' },
    update: {},
    create: {
      username: 'rahul',
      email: 'rahul@itms.local',
      passwordHash: agentHash,
      fullName: 'Rahul Sharma',
      role: 'AGENT',
      department: 'IT Support',
    },
  });

  const agent2 = await prisma.user.upsert({
    where: { username: 'priya' },
    update: {},
    create: {
      username: 'priya',
      email: 'priya@itms.local',
      passwordHash: agentHash,
      fullName: 'Priya Patel',
      role: 'AGENT',
      department: 'IT Support',
    },
  });

  const user1 = await prisma.user.upsert({
    where: { username: 'amit' },
    update: {},
    create: {
      username: 'amit',
      email: 'amit@itms.local',
      passwordHash: userHash,
      fullName: 'Amit Kumar',
      role: 'USER',
      department: 'Accounts',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { username: 'neha' },
    update: {},
    create: {
      username: 'neha',
      email: 'neha@itms.local',
      passwordHash: userHash,
      fullName: 'Neha Singh',
      role: 'USER',
      department: 'HR',
    },
  });

  console.log('✅ Users created');

  // Categories
  const cats = [
    { id: 1, name: 'Hardware', description: 'Hardware related issues' },
    { id: 2, name: 'Software', description: 'Software and application issues' },
    { id: 3, name: 'Network', description: 'Network connectivity issues' },
    { id: 4, name: 'Access', description: 'Access and permissions' },
    { id: 5, name: 'Other', description: 'Miscellaneous issues' },
  ];
  for (const c of cats) {
    await prisma.category.upsert({ where: { id: c.id }, update: {}, create: c });
  }

  const subcats = [
    { id: 6, name: 'Desktop/Laptop', parentId: 1, description: 'Desktop and laptop issues' },
    { id: 7, name: 'Printer', parentId: 1, description: 'Printer issues' },
    { id: 8, name: 'ERP Application', parentId: 2, description: 'ERP specific issues' },
    { id: 9, name: 'Email', parentId: 2, description: 'Email related issues' },
    { id: 10, name: 'Internet', parentId: 3, description: 'Internet connectivity' },
    { id: 11, name: 'VPN', parentId: 3, description: 'VPN access issues' },
    { id: 12, name: 'Password Reset', parentId: 4, description: 'Password reset requests' },
  ];
  for (const c of subcats) {
    await prisma.category.upsert({ where: { id: c.id }, update: {}, create: c });
  }

  console.log('✅ Categories created');

  // SLA Policies
  const slas = [
    { priority: 'LOW', priorityName: 'Low', responseTimeHours: 48, resolutionTimeHours: 168, escalationHours: 96 },
    { priority: 'MEDIUM', priorityName: 'Medium', responseTimeHours: 24, resolutionTimeHours: 72, escalationHours: 48 },
    { priority: 'HIGH', priorityName: 'High', responseTimeHours: 8, resolutionTimeHours: 24, escalationHours: 16 },
    { priority: 'URGENT', priorityName: 'Urgent', responseTimeHours: 2, resolutionTimeHours: 8, escalationHours: 6 },
  ];
  for (const s of slas) {
    await prisma.sLAPolicy.upsert({ where: { priority: s.priority }, update: {}, create: s });
  }

  console.log('✅ SLA policies created');

  // Sample KB articles
  await prisma.kBArticle.createMany({
    data: [
      {
        title: 'How to Reset Your Password',
        content: '1. Go to login page\n2. Click "Forgot Password"\n3. Enter your email\n4. Check email for reset link\n5. Set new password',
        summary: 'Step-by-step password reset guide',
        categoryId: 4,
        keywords: 'password reset forgot login',
        isPublished: true,
        createdBy: admin.id,
        helpfulCount: 15,
      },
      {
        title: 'VPN Connection Troubleshooting',
        content: '1. Check internet connection\n2. Verify VPN credentials\n3. Restart VPN client\n4. Clear VPN cache\n5. Contact IT if issue persists',
        summary: 'Fix common VPN connection problems',
        categoryId: 3,
        keywords: 'vpn connection network remote',
        isPublished: true,
        createdBy: admin.id,
        helpfulCount: 8,
      },
      {
        title: 'Printer Not Responding',
        content: '1. Check printer power\n2. Verify network/USB connection\n3. Check paper and ink\n4. Restart print spooler\n5. Reinstall drivers if needed',
        summary: 'Fix common printer issues',
        categoryId: 1,
        keywords: 'printer not working printing error',
        isPublished: true,
        createdBy: admin.id,
        helpfulCount: 12,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ KB articles created');

  // Sample tickets
  const now = new Date();
  const tickets = [
    {
      ticketNumber: 'TKT-00001',
      title: 'Laptop screen flickering',
      description: 'My laptop screen has been flickering since morning. Difficult to work.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      categoryId: 6,
      requesterId: user1.id,
      assigneeId: agent1.id,
      assignedAt: new Date(now.getTime() - 2 * 3600000),
      createdAt: new Date(now.getTime() - 4 * 3600000),
    },
    {
      ticketNumber: 'TKT-00002',
      title: 'Cannot access ERP system',
      description: 'Getting "Access Denied" error when trying to open ERP module.',
      priority: 'URGENT',
      status: 'ASSIGNED',
      categoryId: 8,
      requesterId: user2.id,
      assigneeId: agent2.id,
      assignedAt: new Date(now.getTime() - 1 * 3600000),
      createdAt: new Date(now.getTime() - 1.5 * 3600000),
    },
    {
      ticketNumber: 'TKT-00003',
      title: 'Need VPN access for remote work',
      description: 'Working from home next week. Need VPN setup.',
      priority: 'MEDIUM',
      status: 'NEW',
      categoryId: 11,
      requesterId: user1.id,
      createdAt: new Date(now.getTime() - 24 * 3600000),
    },
    {
      ticketNumber: 'TKT-00004',
      title: 'Printer on 3rd floor not working',
      description: 'HP printer near accounts department shows offline.',
      priority: 'LOW',
      status: 'RESOLVED',
      categoryId: 7,
      requesterId: user2.id,
      assigneeId: agent1.id,
      assignedAt: new Date(now.getTime() - 48 * 3600000),
      resolvedAt: new Date(now.getTime() - 24 * 3600000),
      resolutionNotes: 'Replaced printer cable and restarted spooler service.',
      createdAt: new Date(now.getTime() - 72 * 3600000),
    },
    {
      ticketNumber: 'TKT-00005',
      title: 'Email not syncing on phone',
      description: 'Outlook app on mobile not receiving new emails since yesterday.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      categoryId: 9,
      requesterId: user1.id,
      assigneeId: agent2.id,
      assignedAt: new Date(now.getTime() - 6 * 3600000),
      createdAt: new Date(now.getTime() - 8 * 3600000),
    },
    {
      ticketNumber: 'TKT-00006',
      title: 'Password reset for SAP',
      description: 'Locked out of SAP after multiple failed login attempts.',
      priority: 'HIGH',
      status: 'CLOSED',
      categoryId: 12,
      requesterId: user2.id,
      assigneeId: agent1.id,
      assignedAt: new Date(now.getTime() - 96 * 3600000),
      resolvedAt: new Date(now.getTime() - 95 * 3600000),
      closedAt: new Date(now.getTime() - 90 * 3600000),
      resolutionNotes: 'Password reset and account unlocked.',
      createdAt: new Date(now.getTime() - 96 * 3600000),
    },
  ];

  for (const t of tickets) {
    await prisma.ticket.upsert({
      where: { ticketNumber: t.ticketNumber },
      update: {},
      create: t,
    });
  }

  console.log('✅ Sample tickets created');

  // Sample comments
  const ticket1 = await prisma.ticket.findUnique({ where: { ticketNumber: 'TKT-00001' } });
  if (ticket1) {
    await prisma.ticketComment.createMany({
      data: [
        {
          ticketId: ticket1.id,
          userId: agent1.id,
          commentText: 'I will check the display cable and drivers. Can you bring the laptop to IT room?',
          isInternal: false,
          createdAt: new Date(now.getTime() - 3 * 3600000),
        },
        {
          ticketId: ticket1.id,
          userId: user1.id,
          commentText: 'Sure, I will bring it in 30 minutes.',
          isInternal: false,
          createdAt: new Date(now.getTime() - 2.5 * 3600000),
        },
        {
          ticketId: ticket1.id,
          userId: agent1.id,
          commentText: 'Looks like a driver issue. Updating graphics driver now.',
          isInternal: true,
          createdAt: new Date(now.getTime() - 1 * 3600000),
        },
      ],
    });
  }

  console.log('✅ Sample comments created');
  console.log('');
  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('   Default logins:');
  console.log('   ┌──────────┬────────────┬─────────┐');
  console.log('   │ Username │ Password   │ Role    │');
  console.log('   ├──────────┼────────────┼─────────┤');
  console.log('   │ admin    │ Admin@123  │ ADMIN   │');
  console.log('   │ rahul    │ Agent@123  │ AGENT   │');
  console.log('   │ priya    │ Agent@123  │ AGENT   │');
  console.log('   │ amit     │ User@123   │ USER    │');
  console.log('   │ neha     │ User@123   │ USER    │');
  console.log('   └──────────┴────────────┴─────────┘');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
