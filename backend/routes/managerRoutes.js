
import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getManagerInbox,
  addToManagerInbox,
  getPendingOrders,
  validateOrder,
  updateOrder,
  cancelOrder,
  getTrash,
  restoreFromTrash,
  emptyTrash,
  moveToTrash
} from '../controllers/managerController.js';
import { managerProtect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.get('/inbox', managerProtect, getManagerInbox);
router.post('/inbox', managerProtect, addToManagerInbox);
router.get('/orders/pending', managerProtect, getPendingOrders);

router.patch(
  '/orders/:id/validate', 
  managerProtect,
  [
    body('price')
      .isFloat({ min: 500 })
      .withMessage('Le prix doit être un nombre valide (min. 500 FCFA)')
  ],
  (req, res, next) => {
    const errors = validationResult(req); 
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  validateOrder
);
router.patch('/orders/:id', managerProtect, updateOrder);
router.patch('/orders/:id/cancel', managerProtect, cancelOrder);
router.get('/trash', managerProtect, getTrash);
router.patch('/trash/:id/restore', managerProtect, restoreFromTrash);
router.delete('/trash', managerProtect, emptyTrash);
router.post('/move-to-trash', managerProtect, moveToTrash);

export default router;








// import express from 'express';
// import { body, validationResult } from 'express-validator';
// import {
//   getManagerInbox,
//   addToManagerInbox,
//   getPendingOrders,
//   validateOrder,
//   updateOrder,
//   cancelOrder,
//   getTrash,
//   restoreFromTrash,
//   emptyTrash,
//   moveToTrash
// } from '../controllers/managerController.js';
// import { managerProtect } from '../middleware/authMiddleware.js'; 

// const router = express.Router();

// router.get('/inbox', managerProtect, getManagerInbox);
// router.post('/inbox', managerProtect, addToManagerInbox);
// router.get('/orders/pending', managerProtect, getPendingOrders);

// router.patch(
//   '/orders/:id/validate', 
//   managerProtect,
//   [
//     body('price')
//       .isFloat({ min: 500 })
//       .withMessage('Le prix doit être un nombre valide (min. 500 FCFA)')
//   ],
//   (req, res, next) => {
//     const errors = validationResult(req); 
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     next();
//   },
//   validateOrder
// );

// router.patch('/orders/:id', managerProtect, updateOrder);
// router.patch('/orders/:id/cancel', managerProtect, cancelOrder);
// router.get('/trash', managerProtect, getTrash);
// router.patch('/trash/:id/restore', managerProtect, restoreFromTrash);
// router.delete('/trash', managerProtect, emptyTrash);
// router.post('/move-to-trash', managerProtect, moveToTrash);

// export default router;