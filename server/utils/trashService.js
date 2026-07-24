import Lead from '../models/Lead.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

/**
 * Automatically checks for leads created more than 7 days ago (createdAt <= 7 days ago)
 * that are not already in status 'Trash'.
 * Updates status to 'Trash', adds system activity note, and creates notifications
 * for Admin and the assigned Employee (if assigned).
 */
export async function checkAndTrashExpiredLeads() {
  try {
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = new Date(Date.now() - SEVEN_DAYS_MS);

    // Find leads created 7+ days ago that are not already in Trash
    const expiredLeads = await Lead.find({
      createdAt: { $lte: sevenDaysAgo },
      status: { $ne: 'Trash' },
    });

    if (!expiredLeads || expiredLeads.length === 0) {
      return;
    }

    console.log(`[TrashService] Moving ${expiredLeads.length} lead(s) older than 7 days to Trash...`);

    for (const lead of expiredLeads) {
      lead.status = 'Trash';

      const activityNote = 'Lead automatically moved to Trash after 7 days.';
      lead.activities.unshift({
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'note',
        note: activityNote,
        authorName: 'System',
        timestamp: new Date().toISOString(),
      });

      await lead.save();

      const timestamp = Date.now();
      const uniqueSuffix = Math.random().toString(36).substr(2, 4);

      // 1. Notify Admin
      await Notification.create({
        id: `notif_${timestamp}_admin_${uniqueSuffix}`,
        title: 'Lead Moved to Trash',
        message: `Lead "${lead.name}" (${lead.assignedTo || 'Unassigned'}) was automatically moved to trash after 7 days.`,
        type: 'trash',
        recipientRole: 'admin',
      });

      // 2. Notify Assigned Employee if assigned
      let employeeRecipient = lead.assignedToRaw;

      if (!employeeRecipient && lead.assignedTo && lead.assignedTo !== 'Unassigned') {
        const emp = await User.findOne({
          $or: [{ id: lead.assignedTo }, { name: lead.assignedTo }],
        }).lean();
        if (emp) {
          employeeRecipient = emp.id;
        }
      }

      if (employeeRecipient) {
        await Notification.create({
          id: `notif_${timestamp}_emp_${uniqueSuffix}`,
          title: 'Lead Moved to Trash',
          message: `Your assigned lead "${lead.name}" was automatically moved to trash after 7 days.`,
          type: 'trash',
          recipientId: employeeRecipient,
        });
      }
    }
  } catch (err) {
    console.error('[TrashService] Error running auto-trash check:', err);
  }
}
