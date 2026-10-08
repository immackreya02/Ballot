import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button, State } from '../components/UI';
import { CheckCircle2, ShieldAlert, Lock, AlertTriangle } from 'lucide-react';

export function SystemState({ type: paramType }) {
  const { type: pathType } = useParams();
  const nav = useNavigate();
  const type = paramType || pathType || 'error';

  const map = {
    loading: ['Loading poll data', 'Fetching current poll parameters and option tallies from verified nodes…'],
    skeleton: ['Skeleton loading', 'Content placeholders preserve layout while data arrives.'],
    error: ['Something went wrong', 'The requested action encountered an error. Please try again.'],
    network: ['Connection interrupted', 'Network connection was lost. Check your connection and retry.'],
    unauthorized: ['Sign in required', 'This page is available only to authenticated voters and poll creators.'],
    forbidden: ['Access restricted', 'Your account does not have permission to manage this poll.'],
    validation: ['Please review the form', 'A question, at least two options, and a valid closing date are required.'],
    unsaved: ['Unsaved changes', 'You have unsaved edits on this poll form.'],
    notfound: ['Poll not found', 'This poll may have been removed, closed, or the URL link is invalid.']
  };

  const d = map[type] || map.error;

  if (type === 'skeleton') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8">
        <div className="skeleton h-10 w-2/3 rounded-xl" />
        <div className="skeleton h-44 rounded-2xl" />
        <div className="skeleton h-44 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <State
        type={type === 'loading' ? 'loading' : type === 'error' || type === 'network' ? 'error' : 'empty'}
        title={d[0]}
        text={d[1]}
        action={type === 'unauthorized' ? 'Sign in to access' : 'Return to polls'}
        onAction={() => nav(type === 'unauthorized' ? '/login' : '/app/polls')}
      />
    </div>
  );
}

export function VoteState({ kind }) {
  const { id } = useParams();
  const nav = useNavigate();
  const data =
    kind === 'already'
      ? ['You’ve already voted', 'This authenticated account has already recorded a vote for this poll.', ['View results', 'Back to polls']]
      : kind === 'closed'
      ? ['This poll is closed', 'Voting has concluded for this poll. Final tallies remain visible in the archive.', ['View final results', 'Browse archive']]
      : ['Vote submitted', 'Your ballot choice has been verified and recorded.', ['View live results', 'Back to workspace']];

  const targetResultsPath = id ? `/results/${id}` : '/app/polls';

  return (
    <section className="mx-auto max-w-xl py-20 text-center space-y-4">
      <CheckCircle2 className="mx-auto text-olive" size={56} />
      <h1 className="font-serif text-5xl">{data[0]}</h1>
      <p className="text-muted leading-relaxed max-w-md mx-auto">{data[1]}</p>
      <div className="mt-8 flex justify-center gap-3 pt-2">
        <Button onClick={() => nav(targetResultsPath)}>{data[2][0]}</Button>
        <Button variant="secondary" onClick={() => nav('/app/polls')}>
          {data[2][1]}
        </Button>
      </div>
    </section>
  );
}

export function PublishConfirmation() {
  const nav = useNavigate();
  return (
    <section className="mx-auto max-w-2xl py-16 text-center space-y-4">
      <CheckCircle2 className="mx-auto text-olive" size={56} />
      <p className="label">Publish confirmation</p>
      <h1 className="font-serif text-5xl">Your poll is live.</h1>
      <p className="text-muted leading-relaxed max-w-md mx-auto">
        Voters can now view the neutral ballot and submit authenticated votes.
      </p>
      <div className="mt-8 flex justify-center gap-3 pt-2">
        <Button onClick={() => nav('/app/polls/transport/share')}>Publish & Share link</Button>
        <Button variant="secondary" onClick={() => nav('/app/polls/transport')}>
          Manage poll
        </Button>
      </div>
    </section>
  );
}
