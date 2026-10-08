import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pollAPI, voterGroupAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, PageHeader, ConfirmModal, useToast } from '../components/UI';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  LockKeyhole,
  Eye,
  CheckCircle2,
  Save,
  Users,
  FileSpreadsheet
} from 'lucide-react';

export function CreatePoll({ edit = false }) {
  const nav = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [question, setQuestion] = useState('Which project should receive the Q3 community grant?');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState([
    'Solar Panel Installation on Community Center',
    'Park Bench & Landscaping Renovation',
    'Public Wi-Fi Expansion'
  ]);
  const [resultVisibility, setResultVisibility] = useState('LIVE');
  const [electorateSourceType, setElectorateSourceType] = useState('SPECIFIC');
  const [voterGroupId, setVoterGroupId] = useState('');
  const [specificEmails, setSpecificEmails] = useState('');

  const [voterGroups, setVoterGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);

  // Load voter groups on mount
  useEffect(() => {
    async function loadGroups() {
      try {
        const res = await voterGroupAPI.getAll();
        setVoterGroups(res.groups || []);
        if (res.groups && res.groups.length > 0) {
          setVoterGroupId(res.groups[0]._id);
        }
      } catch (err) {
        console.warn('Could not load voter groups:', err.message);
      }
    }
    loadGroups();
  }, []);

  const addOption = () => {
    if (options.length >= 10) {
      showToast('Maximum 10 options allowed', 'error');
      return;
    }
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length <= 2) {
      showToast('A poll must have at least 2 options', 'error');
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const moveOption = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= options.length) return;
    const updated = [...options];
    const item = updated.splice(fromIndex, 1)[0];
    updated.splice(toIndex, 0, item);
    setOptions(updated);
  };

  const calculatePreviewCount = () => {
    if (electorateSourceType === 'GROUP') {
      const selected = voterGroups.find((g) => g._id === voterGroupId);
      return selected && selected.emails ? selected.emails.length : 0;
    }
    return specificEmails
      ? [...new Set(specificEmails.split(/[\n,;]/).map((e) => e.trim().toLowerCase()).filter((e) => e.includes('@')))].length
      : 0;
  };

  const handleSaveDraft = async () => {
    if (!question.trim()) {
      showToast('Please enter a poll question', 'error');
      return;
    }
    const validOptions = options.filter((o) => o.trim().length > 0);
    if (validOptions.length < 2) {
      showToast('Please provide at least 2 non-empty choices', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await pollAPI.create({
        title: question.trim(),
        description: description.trim(),
        options: validOptions,
        resultVisibility,
        electorateSourceType,
        voterGroupId: electorateSourceType === 'GROUP' ? voterGroupId : undefined,
        specificEmails: electorateSourceType === 'SPECIFIC' ? specificEmails : undefined
      });
      showToast('Poll draft created successfully!');
      nav('/app/polls/drafts');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!question.trim()) {
      showToast('Please enter a poll question', 'error');
      return;
    }
    const validOptions = options.filter((o) => o.trim().length > 0);
    if (validOptions.length < 2) {
      showToast('Please provide at least 2 non-empty choices', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Create draft
      const draftRes = await pollAPI.create({
        title: question.trim(),
        description: description.trim(),
        options: validOptions,
        resultVisibility,
        electorateSourceType,
        voterGroupId: electorateSourceType === 'GROUP' ? voterGroupId : undefined,
        specificEmails: electorateSourceType === 'SPECIFIC' ? specificEmails : undefined
      });

      // 2. Publish draft (locks electorate & generates pollCode)
      const pubRes = await pollAPI.publish(draftRes.poll._id, {
        specificEmails: electorateSourceType === 'SPECIFIC' ? specificEmails : undefined
      });

      setModal(false);
      showToast(`Poll Published! Code: ${pubRes.poll.pollCode}`);
      nav(`/app/polls/${pubRes.poll._id}`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="New Poll Wizard" title="Configure Poll & Electorate" />

      <div className="grid gap-8 xl:grid-cols-[1.15fr_.85fr]">
        <div className="card p-6 md:p-8 space-y-7">
          {/* Question */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label">Poll Title / Question</label>
              <span className="font-mono text-xs text-muted">{question.length}/200</span>
            </div>
            <textarea
              className="field min-h-24 text-lg font-medium"
              value={question}
              maxLength={200}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your poll question…"
            />
          </div>

          {/* Description */}
          <div>
            <label className="label mb-1 block">Context or Description (Optional)</label>
            <input
              className="field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide background context or proposal details for voters…"
            />
          </div>

          {/* Options */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="label">Poll Options (Neutral Presentation)</label>
              <span className="font-mono text-xs text-muted">{options.length} choices</span>
            </div>

            <div className="space-y-3">
              {options.map((o, i) => (
                <div className="flex items-center gap-2" key={i}>
                  <div className="flex flex-col gap-0.5 text-muted">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => moveOption(i, i - 1)}
                      className="p-0.5 hover:text-ink disabled:opacity-20"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={i === options.length - 1}
                      onClick={() => moveOption(i, i + 1)}
                      className="p-0.5 hover:text-ink disabled:opacity-20"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                  <input
                    className="field font-medium"
                    value={o}
                    onChange={(e) =>
                      setOptions(options.map((x, n) => (n === i ? e.target.value : x)))
                    }
                    placeholder={`Option ${i + 1}`}
                  />
                  <button
                    type="button"
                    disabled={options.length <= 2}
                    onClick={() => removeOption(i)}
                    className="rounded-lg border border-line p-2.5 hover:bg-terra/10 hover:text-terra disabled:opacity-30"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <Button variant="secondary" className="mt-4" onClick={addOption}>
              <Plus size={16} />
              Add Option
            </Button>
          </div>

          {/* ELECTORATE CONFIGURATION */}
          <div className="border-t border-line pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <label className="label">Electorate / Eligibility Definition</label>
              <span className="rounded-full bg-terra/10 text-terra border border-terra/30 px-2.5 py-0.5 font-mono text-xs font-bold">
                {calculatePreviewCount()} Eligible Voters
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setElectorateSourceType('SPECIFIC')}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 ${
                  electorateSourceType === 'SPECIFIC'
                    ? 'border-2 border-ink bg-warm font-semibold'
                    : 'border-line bg-paper text-muted'
                }`}
              >
                <FileSpreadsheet className="shrink-0 mt-0.5 text-terra" size={20} />
                <div>
                  <b className="text-ink block text-sm">Paste Email List</b>
                  <span className="text-xs text-muted leading-tight block">Enter custom voter email addresses for this poll.</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setElectorateSourceType('GROUP')}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 ${
                  electorateSourceType === 'GROUP'
                    ? 'border-2 border-ink bg-warm font-semibold'
                    : 'border-line bg-paper text-muted'
                }`}
              >
                <Users className="shrink-0 mt-0.5 text-olive" size={20} />
                <div>
                  <b className="text-ink block text-sm">Select Voter Group</b>
                  <span className="text-xs text-muted leading-tight block">Use a saved reusable electorate group.</span>
                </div>
              </button>
            </div>

            {electorateSourceType === 'GROUP' ? (
              <div>
                <label className="label block mb-1">Select Reusable Voter Group</label>
                {voterGroups.length ? (
                  <select
                    className="field font-medium"
                    value={voterGroupId}
                    onChange={(e) => setVoterGroupId(e.target.value)}
                  >
                    {voterGroups.map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.name} ({g.emails ? g.emails.length : 0} emails)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-xl border border-line bg-paper p-4 text-xs text-muted">
                    No saved voter groups found. Create one under "Voter Groups" page or switch to "Paste Email List".
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="label block mb-1">Paste Eligible Voter Emails</label>
                <textarea
                  className="field font-mono text-xs min-h-28"
                  placeholder="Paste eligible email addresses separated by line breaks or commas…&#10;person1@gmail.com&#10;person2@gmail.com"
                  value={specificEmails}
                  onChange={(e) => setSpecificEmails(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* RESULT VISIBILITY MODE */}
          <div className="border-t border-line pt-6">
            <label className="label block mb-1">Result Visibility Mode</label>
            <select
              className="field font-medium"
              value={resultVisibility}
              onChange={(e) => setResultVisibility(e.target.value)}
            >
              <option value="LIVE">LIVE — Results visible in real-time while voting occurs</option>
              <option value="AFTER_VOTE">AFTER_VOTE — Results visible to a voter after casting ballot</option>
              <option value="AFTER_CLOSE">AFTER_CLOSE — Results hidden until poll closes</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-line pt-6">
            <Button variant="secondary" onClick={handleSaveDraft} disabled={loading}>
              <Save size={16} /> Save Draft
            </Button>
            <Button onClick={() => setModal(true)} disabled={loading}>
              Publish Poll Now
            </Button>
          </div>
        </div>

        {/* MIRROR PREVIEW SIDEBAR */}
        <aside className="card h-fit p-6 space-y-4 bg-warm border-2 border-line">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="label">Live Voter Preview</div>
            <span className="rounded-full bg-paper border border-line px-2.5 py-0.5 font-mono text-[10px] text-muted">
              MIRROR MODE
            </span>
          </div>

          <h2 className="font-serif text-3xl leading-snug">
            {question || 'Your poll question will appear here'}
          </h2>

          {description && <p className="text-sm text-muted leading-relaxed">{description}</p>}

          <div className="space-y-2.5 pt-2">
            {options.map((o, idx) => (
              <div key={idx} className="poll-option flex items-center gap-3">
                <span className="font-mono text-xs text-muted">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="font-medium text-ink">{o || `Option ${idx + 1}`}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-line text-xs font-mono text-muted space-y-1">
            <div>Electorate: <b>{calculatePreviewCount()} authorized voters</b></div>
            <div>Result Visibility: <b>{resultVisibility}</b></div>
          </div>
        </aside>
      </div>

      <ConfirmModal
        open={modal}
        title="Publish Poll & Lock Electorate?"
        onClose={() => setModal(false)}
        onConfirm={handlePublish}
        confirm="Publish Poll Now"
      >
        You are about to publish <b>"{question}"</b> to <b>{calculatePreviewCount()} eligible voters</b>. Once published, a unique Poll Code will be generated and the electorate list will be locked.
      </ConfirmModal>
    </>
  );
}

export function PollPreview() {
  return null;
}
