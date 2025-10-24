import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
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
    ]
  })

  await prisma.addon.createMany({
    data: [
      { name: 'Recharge +100 billes', priceCents: 600 },
      { name: 'Combinaison intégrale tissu', priceCents: 400 },
      { name: 'Gants coqués', priceCents: 250 },
      { name: 'Costume de lapin', priceCents: 2500 },
      { name: 'Nocturne (>=20h) /pers', priceCents: 400 }
    ]
  })

  await prisma.resource.create({
    data: { name: 'Terrain A', capacity: 1 }
  })
}

main().finally(() => prisma.$disconnect())
