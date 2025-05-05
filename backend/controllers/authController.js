import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const register = async (req, res) => {
  const { username, password } = req.body  // ⛔️ 'role' yok
  if (!username || !password) {
    return res.status(400).json({ error: 'Tüm alanlar zorunlu' })
  }

  const existingUser = await prisma.user.findUnique({ where: { username } })
  if (existingUser) return res.status(400).json({ error: 'Kullanıcı zaten var' })

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      role: 'user'  // ✅ sabit
    }
  })

  res.status(201).json({ message: 'Kullanıcı oluşturuldu', userId: user.id })
}



export const login = async (req, res) => {
  const { username, password } = req.body
  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) return res.status(401).json({ error: 'Geçersiz kimlik bilgisi' })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ error: 'Geçersiz kimlik bilgisi' })

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' })
  res.json({ token, role: user.role })
}
