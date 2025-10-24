import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  await prisma.settings.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      openingHours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '19:00', closed: false },
        sunday: { open: '10:00', close: '17:00', closed: true }
      }
    }
  })

  await prisma.package.createMany({
    data: [
      { name: 'Découverte', priceCents: 2000, includedBalls: 120, durationMin: 120 },
      { name: 'Méditerranée', priceCents: 2500, includedBalls: 200, durationMin: 120 },
      { name: 'Player', priceCents: 3000, includedBalls: 300, durationMin: 120 },
      { name: 'Punisher', priceCents: 3500, includedBalls: 450, durationMin: 120, isPromo: true },
      { name: 'Expendables', priceCents: 4500, includedBalls: 600, durationMin: 120 },
      { name: 'Tout public (dès 8 ans)', priceCents: 1800, includedBalls: 120, durationMin: 90 },
      { name: 'Link Ranger - Paintball', priceCents: 1800, includedBalls: 120, durationMin: 90 },
      { name: 'Link Ranger - Orbeez', priceCents: 1800, includedBalls: 1600, durationMin: 60 }
    ],
    skipDuplicates: true,
  })

  await prisma.addon.createMany({
    data: [
      { name: 'Recharge +100 billes', priceCents: 600 },
      { name: 'Combinaison intégrale tissu', priceCents: 400 },
      { name: 'Gants coqués', priceCents: 250 },
      { name: 'Costume de lapin', priceCents: 2500 },
      { name: 'Nocturne (>=20h) /pers', priceCents: 400 }
    ],
    skipDuplicates: true,
  })

  const existingResource = await prisma.resource.findFirst({
    where: { name: 'Terrain A' }
  })

  if (!existingResource) {
    await prisma.resource.create({
      data: { name: 'Terrain A', capacity: 1 }
    })
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@paintball.test'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'paintball123'

  const passwordHash = await hash(adminPassword, 12)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Administrateur',
      role: 'ADMIN',
      passwordHash,
    },
  })
}

main().finally(() => prisma.$disconnect())
