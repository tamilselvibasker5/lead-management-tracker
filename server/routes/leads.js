import express from 'express';
import Lead from '../models/Lead.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { checkAndTrashExpiredLeads } from '../utils/trashService.js';

const router = express.Router();

// GET /api/leads
router.get('/', async (req, res) => {
  try {
    await checkAndTrashExpiredLeads();
    const { assignedTo } = req.query;
    let filter = {};

    if (assignedTo) {
      const employee = await User.findOne({
        $or: [{ id: assignedTo }, { name: assignedTo }],
      }).select('id name').lean();

      if (employee) {
        filter = {
          $or: [
            { assignedToRaw: employee.id },
            { assignedTo: employee.name },
            { assignedToRaw: assignedTo },
            { assignedTo: assignedTo },
          ],
        };
      } else {
        filter = {
          $or: [{ assignedToRaw: assignedTo }, { assignedTo: assignedTo }],
        };
      }
    }

    const leads = await Lead.find(filter).sort({ createdAt: -1 }).lean();
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads (add single lead)
router.post('/', async (req, res) => {
  try {
    const leadData = req.body;
    const newId = `lead_${Date.now()}`;
    
    let assigneeName = 'Unassigned';
    let assigneeRaw = leadData.assignedTo || null;

    if (leadData.assignedTo) {
      const emp = await User.findOne({
        $or: [{ id: leadData.assignedTo }, { name: leadData.assignedTo }],
      });
      if (emp) {
        assigneeName = emp.name;
        assigneeRaw = emp.id;
      }
    }

    const lead = new Lead({
      id: newId,
      platform: leadData.platform || 'Website',
      name: leadData.name,
      email: leadData.email || '—',
      phone: leadData.phone || '—',
      location: leadData.location || '—',
      assignedTo: assigneeName,
      assignedToRaw: assigneeRaw,
      status: leadData.status || 'New',
      callCount: leadData.callCount || 0,
      followUpDate: leadData.followUpDate || null,
      notes: leadData.notes || '',
      activities: leadData.activities || [],
      createdBy: leadData.createdBy || null,
      createdByRole: leadData.createdByRole || null,
    });

    await lead.save();

    // Notify assigned employee if assigned on creation
    if (assigneeRaw) {
      await Notification.create({
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        title: 'New Lead Assigned',
        message: `You got a new lead: ${lead.name} (${lead.platform || 'Direct'})`,
        type: 'assignment',
        recipientId: assigneeRaw,
      });
    }

    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads/import (bulk import)
router.post('/import', async (req, res) => {
  try {
    const { leads: rawLeads, creatorId, creatorRole } = req.body;
    if (!Array.isArray(rawLeads)) {
      return res.status(400).json({ error: 'leads must be an array' });
    }

    const createdLeads = [];
    for (const item of rawLeads) {
      const newId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

      let assigneeName = 'Unassigned';
      let assigneeRaw = null;

      const rawAssigned = item.assignedTo || item['Assigned to'] || item.AssignedTo;
      if (rawAssigned && rawAssigned !== 'Unassigned') {
        const emp = await User.findOne({
          $or: [{ id: rawAssigned }, { name: rawAssigned }],
        });
        if (emp) {
          assigneeName = emp.name;
          assigneeRaw = emp.id;
        } else {
          assigneeName = rawAssigned;
          assigneeRaw = rawAssigned;
        }
      }

      const lead = new Lead({
        id: item.id || newId,
        platform: item.platform || item.Platform || item.Source || 'Website',
        name: item.name || item.Name || '—',
        email: item.email || item.Email || '—',
        phone: item.phone || item.Phone || '—',
        location: item.location || item.Location || item.Address || item.City || item.State || item.Place || '—',
        assignedTo: assigneeName,
        assignedToRaw: assigneeRaw,
        status: item.status || item.Status || 'New',
        callCount: Number(item.callCount) || 0,
        followUpDate: item.followUpDate || null,
        notes: item.notes || item.Notes || '',
        activities: Array.isArray(item.activities) ? item.activities : [],
        createdBy: creatorId || null,
        createdByRole: creatorRole || null,
      });
      await lead.save();
      createdLeads.push(lead);
    }

    // Trigger Notification for ALL (Both Employees & Admins)
    if (createdLeads.length > 0) {
      await Notification.create({
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        title: 'Leads Imported',
        message: `${createdLeads.length} new lead(s) were imported into the system.`,
        type: 'import',
        recipientRole: 'all',
        senderId: creatorId || null,
      });
    }

    res.status(201).json({ count: createdLeads.length, leads: createdLeads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/leads/:id (update details)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const lead = await Lead.findOneAndUpdate({ id }, updates, { returnDocument: 'after' });
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/leads/:id/status (update status)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const lead = await Lead.findOneAndUpdate({ id }, { status }, { returnDocument: 'after' });
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/leads/:id/assign (assign lead)
router.put('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    let assigneeName = 'Unassigned';
    let assigneeRaw = employeeId || null;

    if (employeeId) {
      const emp = await User.findOne({
        $or: [{ id: employeeId }, { name: employeeId }],
      });
      if (emp) {
        assigneeName = emp.name;
        assigneeRaw = emp.id;
      }
    }

    const lead = await Lead.findOneAndUpdate(
      { id },
      { assignedTo: assigneeName, assignedToRaw: assigneeRaw },
      { returnDocument: 'after' }
    );

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Trigger Notification for the assigned employee
    if (assigneeRaw) {
      await Notification.create({
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        title: 'New Lead Assigned',
        message: `You got a new lead: ${lead.name} (${lead.platform || 'Direct'})`,
        type: 'assignment',
        recipientId: assigneeRaw,
      });
    }

    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads/:id/swap (swap lead between employees)
router.post('/:id/swap', async (req, res) => {
  try {
    const { id } = req.params;
    const { targetEmployeeId, targetEmployeeName, reason, currentUserId, currentUserName } = req.body;

    const lead = await Lead.findOne({ id });
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    let targetEmpName = targetEmployeeName || 'Employee';
    let targetEmpId = targetEmployeeId;

    if (targetEmployeeId) {
      const emp = await User.findOne({
        $or: [{ id: targetEmployeeId }, { name: targetEmployeeId }],
      });
      if (emp) {
        targetEmpName = emp.name;
        targetEmpId = emp.id;
      }
    }

    // Record swap activity in lead history
    lead.assignedTo = targetEmpName;
    lead.assignedToRaw = targetEmpId;
    lead.activities.unshift({
      id: `act_${Date.now()}`,
      type: 'note',
      note: `Lead swapped from ${currentUserName || 'employee'} to ${targetEmpName}. Reason: ${reason}`,
      authorName: currentUserName || 'System',
      timestamp: new Date().toISOString(),
    });

    await lead.save();

    const timestamp = Date.now();
    const swappingUser = currentUserName || 'An employee';

    // 1. Notify ONLY the ADMIN
    await Notification.create({
      id: `notif_${timestamp}_admin_${Math.random().toString(36).substr(2, 4)}`,
      title: 'Lead Swapped',
      message: `${swappingUser} swapped lead "${lead.name}" with ${targetEmpName}. Reason: ${reason}`,
      type: 'swap',
      recipientRole: 'admin',
      senderId: currentUserId || null,
      senderName: swappingUser,
    });

    // 2. Notify ONLY the SWAPPED EMPLOYEE (target employee)
    if (targetEmpId) {
      await Notification.create({
        id: `notif_${timestamp}_emp_${Math.random().toString(36).substr(2, 4)}`,
        title: 'Lead Swapped To You',
        message: `You received lead "${lead.name}" via swap from ${swappingUser}. Reason: ${reason}`,
        type: 'swap',
        recipientId: targetEmpId,
        senderId: currentUserId || null,
        senderName: swappingUser,
      });
    }

    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads/:id/activities (add activity)
router.post('/:id/activities', async (req, res) => {
  try {
    const { id } = req.params;
    const activity = req.body || {};

    const noteContent = (activity.note || activity.text || activity.message || activity.description || '').trim();

    const newActivity = {
      id: activity.id || `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: activity.type || 'note',
      note: noteContent || 'Activity logged',
      authorName: activity.authorName || 'System',
      timestamp: activity.timestamp || new Date().toISOString(),
    };

    const lead = await Lead.findOne({ id });
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    lead.activities.unshift(newActivity);
    await lead.save();

    res.status(201).json(newActivity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/leads/all (bulk delete all leads)
router.delete('/all', async (req, res) => {
  try {
    await Lead.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/leads/:id (delete lead)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Lead.deleteOne({ id });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
