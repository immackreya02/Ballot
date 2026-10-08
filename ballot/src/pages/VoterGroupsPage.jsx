import React, { useState, useEffect } from 'react';
import { voterGroupAPI } from '../services/api';
import { Button, PageHeader, ConfirmModal, useToast, State } from '../components/UI';
import { Users, Plus, Edit3, Trash2, Mail, CheckCircle2, FileText } from 'lucide-react';

export function VoterGroupsPage() {
  const { showToast } = useToast();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editGroup, setEditGroup] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rawEmails, setRawEmails] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedDeleteGroup, setSelectedDeleteGroup] = useState(null);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await voterGroupAPI.getAll();
      setGroups(res.groups);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const openCreateModal = () => {
    setEditGroup(null);
    setName('');
    setDescription('');
    setRawEmails('');
    setModalOpen(true);
  };

  const openEditModal = (grp) => {
    setEditGroup(grp);
    setName(grp.name);
    setDescription(grp.description || '');
    setRawEmails(grp.emails ? grp.emails.join('\n') : '');
    setModalOpen(true);
  };

  const handleSaveGroup = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Group name is required.', 'error');
      return;
    }

    try {
      if (editGroup) {
        await voterGroupAPI.update(editGroup._id, {
          name: name.trim(),
          description,
          emails: rawEmails
        });
        showToast('Voter group updated successfully!');
      } else {
        await voterGroupAPI.create({
          name: name.trim(),
          description,
          emails: rawEmails
        });
        showToast('Voter group created successfully!');
      }
      setModalOpen(false);
      loadGroups();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedDeleteGroup) return;
    try {
      await voterGroupAPI.delete(selectedDeleteGroup._id);
      showToast('Voter group deleted.');
      setDeleteModal(false);
      loadGroups();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Helper count for instant UI preview
  const parsedCount = rawEmails
    ? [...new Set(rawEmails.split(/[\n,;]/).map((e) => e.trim().toLowerCase()).filter((e) => e.includes('@')))].length
    : 0;

  return (
    <section className="space-y-6">
      <PageHeader eyebrow="Organizer Workspace" title="Reusable Voter Groups">
        <Button onClick={openCreateModal}>
          <Plus size={16} />
          Create Voter Group
        </Button>
      </PageHeader>

      <p className="text-muted text-sm max-w-3xl leading-relaxed">
        Define reusable electorate groups (e.g. "Greenwood Residents", "Marketing Department", "Club Members"). Select a group when creating future polls instead of importing the same email list repeatedly.
      </p>

      {loading ? (
        <div className="card p-8 text-center text-muted font-mono">Loading voter groups…</div>
      ) : groups.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {groups.map((grp) => (
            <div key={grp._id} className="card p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif text-2xl">{grp.name}</h3>
                  <span className="rounded-full bg-paper border border-line px-3 py-1 font-mono text-xs font-bold text-ink">
                    {grp.emails ? grp.emails.length : 0} eligible emails
                  </span>
                </div>
                {grp.description && <p className="text-sm text-muted mb-4">{grp.description}</p>}

                {grp.emails && grp.emails.length > 0 && (
                  <div className="rounded-xl border border-line bg-warm p-3 text-xs font-mono text-muted space-y-1 max-h-32 overflow-auto">
                    {grp.emails.slice(0, 5).map((e, i) => (
                      <div key={i} className="truncate">• {e}</div>
                    ))}
                    {grp.emails.length > 5 && (
                      <div className="text-terra font-bold pt-1">+{grp.emails.length - 5} more emails</div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-line pt-4">
                <Button variant="secondary" className="text-xs" onClick={() => openEditModal(grp)}>
                  <Edit3 size={14} /> Edit Group
                </Button>
                <Button
                  variant="secondary"
                  className="text-xs text-terra border-terra/30 hover:bg-terra/10"
                  onClick={() => {
                    setSelectedDeleteGroup(grp);
                    setDeleteModal(true);
                  }}
                >
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <State
          type="empty"
          title="No Voter Groups Created Yet"
          text="Create reusable groups of eligible voter email addresses to select when publishing restricted polls."
          action="Create your first voter group"
          onAction={openCreateModal}
        />
      )}

      {/* CREATE / EDIT GROUP MODAL */}
      <ConfirmModal
        open={modalOpen}
        title={editGroup ? 'Edit Voter Group' : 'Create Reusable Voter Group'}
        onClose={() => setModalOpen(false)}
        onConfirm={handleSaveGroup}
        confirm={editGroup ? 'Save Changes' : 'Create Group'}
      >
        <form onSubmit={handleSaveGroup} className="space-y-4 text-left pt-2">
          <label className="block">
            <span className="label block mb-1">Group Name</span>
            <input
              required
              className="field"
              placeholder="e.g. Greenwood Residents, Marketing Dept"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="label block mb-1">Description (Optional)</span>
            <input
              className="field"
              placeholder="Brief description of electorate group"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label">Eligible Voter Email Addresses</label>
              <span className="font-mono text-xs text-terra font-bold">{parsedCount} valid unique emails</span>
            </div>
            <textarea
              className="field font-mono text-xs min-h-32"
              placeholder="Paste or type email addresses separated by line breaks or commas…&#10;person1@gmail.com&#10;person2@gmail.com"
              value={rawEmails}
              onChange={(e) => setRawEmails(e.target.value)}
            />
            <p className="mt-1 text-[11px] text-muted">
              Emails will be automatically normalized and deduplicated upon saving.
            </p>
          </div>
        </form>
      </ConfirmModal>

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        open={deleteModal}
        title="Delete Voter Group?"
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeleteGroup}
        confirm="Delete Group"
      >
        Are you sure you want to delete <b>{selectedDeleteGroup?.name}</b>? This will not affect existing published polls.
      </ConfirmModal>
    </section>
  );
}
