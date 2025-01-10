const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateSchedules() {
  try {
    const result = await prisma.schedule.updateMany({
      where: {
        type: null
      },
      data: {
        type: 'monthly'
      }
    })
    console.log(`Updated ${result.count} schedules`)
  } catch (error) {
    console.error('Error updating schedules:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateSchedules()