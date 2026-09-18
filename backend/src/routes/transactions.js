import { Router } from "express";
import {
  exportCsv,
  exportExcel,
  getFilters,
  getRecent,
  getStats,
  listTransactions,
} from "../controllers/transactions.js";

const router = Router();

router.get("/", listTransactions);
router.get("/recent", getRecent);
router.get("/stats", getStats);
router.get("/filters", getFilters);
router.get("/export", exportCsv);
router.get("/export/excel", exportExcel);

export default router;
