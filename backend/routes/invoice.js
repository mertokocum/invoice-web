import express from 'express'
import { uploadInvoice, listInvoices, getInvoiceById } from '../controllers/invoiceController.js'

const router = express.Router()

router.post('/', uploadInvoice)
router.get('/', listInvoices)
router.get('/:id', getInvoiceById)

export default router
