  // server.js
  import express from 'express'
  import cors from 'cors'
  import multer from 'multer'
  import dotenv from 'dotenv'
  import jwt from 'jsonwebtoken'
  import bcrypt from 'bcrypt'
  import { PrismaClient } from '@prisma/client'
  import invoiceRoutes from './routes/invoice.js'
  import authRoutes from './routes/auth.js'
  import userRoutes from './routes/user.js'

  const app = express()
  dotenv.config()

  const prisma = new PrismaClient()
  app.use(cors())
  app.use(express.json())

  const upload = multer({ dest: 'uploads/' })

  // Middleware: auth
  app.use(async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await prisma.user.findUnique({ where: { id: decoded.id } })
        req.user = user
      } catch (err) {
        console.error('Invalid token')
      }
    }
    next()
  })

  app.use('/api/invoices', upload.single('file'), invoiceRoutes)
  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/uploads', express.static('uploads'))

  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
