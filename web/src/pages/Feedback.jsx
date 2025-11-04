import { useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { toast } from '../lib/toast.js';
import { MessageSquare, Upload, Send } from 'lucide-react';

export default function Feedback() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [category, setCategory] = useState('bug');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [includeDiag, setIncludeDiag] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      toast('Please fill in subject and message', 'error');
      return;
    }

    setIsSubmitting(true);

    // Mock submission - store in localStorage
    const payload = {
      id: `FB-${Date.now()}`,
      category,
      subject,
      message,
      file: file?.name,
      submittedBy: currentUser?.name || 'Unknown',
      submittedEmail: currentUser?.email || '',
      submittedAt: new Date().toISOString(),
      diagnostics: includeDiag
        ? {
            role: currentUser?.role,
            site: currentUser?.activeSite,
            version: '1.4.0',
          }
        : undefined,
    };

    // Store feedback in localStorage
    const existing = JSON.parse(localStorage.getItem('feedback_submissions') || '[]');
    existing.push(payload);
    localStorage.setItem('feedback_submissions', JSON.stringify(existing));

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast('Thank you for your feedback!', 'success');
      
      // Reset form
      setSubject('');
      setMessage('');
      setFile(null);
    }, 500);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast('File size must be less than 5MB', 'error');
        return;
      }
      setFile(selectedFile);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-2 flex items-center gap-2">
          <MessageSquare className="text-[#F7931E]" size={28} />
          Feedback & Suggestions
        </h1>
        <p className="text-sm text-zinc-400">
          We'd love to hear from you. Help us improve CoreStock.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-zinc-800">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Your Name</label>
            <div className="input bg-zinc-950 border-zinc-700 text-zinc-300">
              {currentUser?.name || 'Not logged in'}
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Your Role</label>
            <div className="input bg-zinc-950 border-zinc-700 text-zinc-300">
              {currentUser?.role || 'N/A'}
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium mb-2 block">Feedback Type</label>
          <select
            className="input w-full"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="bug">🐛 Bug Report</option>
            <option value="feature">✨ Feature Request</option>
            <option value="ui">🎨 UI/UX Issue</option>
            <option value="data">📊 Data Issue</option>
            <option value="other">💡 Other</option>
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Subject <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            className="input w-full"
            placeholder="Brief description of your feedback"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        {/* Message */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Message <span className="text-red-400">*</span>
          </label>
          <textarea
            className="input w-full min-h-[160px] resize-y"
            placeholder="Describe your feedback in detail..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <p className="text-xs text-zinc-500 mt-1">
            {message.length} characters
          </p>
        </div>

        {/* File Upload */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Screenshot / File (optional)
          </label>
          <div className="flex items-center gap-3">
            <label className="btn-secondary cursor-pointer">
              <Upload size={16} />
              {file ? file.name : 'Choose File'}
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
            </label>
            {file && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                Remove
              </button>
            )}
            {file && (
              <span className="text-xs text-zinc-500">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Accepted: Images, PDF. Max 5MB.
          </p>
        </div>

        {/* Diagnostics */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={includeDiag}
            onChange={(e) => setIncludeDiag(e.target.checked)}
            className="rounded border-zinc-700"
          />
          <span>Include diagnostic information (role, site, version)</span>
        </label>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
          <button
            type="submit"
            className="btn bg-[#F7931E]/20 hover:bg-[#F7931E]/30 border-[#F7931E]/30 text-[#F7931E]"
            disabled={isSubmitting || !subject.trim() || !message.trim()}
          >
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                <Send size={16} />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Note */}
      <div className="card p-4 bg-blue-900/20 border-blue-800/30">
        <p className="text-sm text-blue-300">
          💡 <strong>Tip:</strong> Be as specific as possible. Include steps to reproduce for bugs,
          or mockups/wireframes for feature requests. This helps us respond faster!
        </p>
      </div>
    </div>
  );
}

