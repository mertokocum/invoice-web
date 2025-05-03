import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const listUsers = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Yetkisiz erişim' })
  }

  const users = await prisma.user.findMany({
    select: { id: true, username: true, role: true }
  })

  res.json(users)
}

export const deleteUser = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Yetkisiz erişim' })
  }

  const id = parseInt(req.params.id)

  try {
    await prisma.user.delete({ where: { id } })
    res.json({ message: 'Kullanıcı silindi' })
  } catch (err) {
    res.status(500).json({ error: 'Kullanıcı silinemedi' })
  }
}
