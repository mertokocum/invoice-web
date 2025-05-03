import express from 'express'
import { listUsers, deleteUser } from '../controllers/userController.js'

const router = express.Router()

// Admin kullanıcılar için erişim
router.get('/', listUsers)
router.delete('/:id', deleteUser)

export default router
