import express from 'express';
import { 
  getInboxMessages, 
  processInboxMessage, 
  getSystemLogs, 
  getResourceStatus, 
  getAiConfig, 
  setEmergencyStop, 
  getPendingTasks, 
  updateTask, 
  sendNotification, 
  createGitHubBranch, 
  testNgrok 
} from '../controllers/openclawController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = express.Router();

// All routes require admin or ai_operator role
router.use(authenticate, authorize(['admin', 'ai_operator']));

router.get('/inbox', getInboxMessages);
router.put('/inbox/:id/process', processInboxMessage);
router.get('/logs', getSystemLogs);
router.get('/resources', getResourceStatus);
router.get('/config', getAiConfig);
router.post('/emergency', setEmergencyStop);
router.get('/tasks', getPendingTasks);
router.put('/tasks/:id', updateTask);
router.post('/notify', sendNotification);
router.post('/github/branch', createGitHubBranch);
router.get('/ngrok/test', testNgrok);

export default router;
