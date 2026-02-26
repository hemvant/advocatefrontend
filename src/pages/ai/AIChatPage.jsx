import React, { useState, useEffect, useRef } from 'react';
import {
  getChatSessions,
  postChatStart,
  postChatMessage,
  getChatHistory,
  updateChatSession,
  deleteChatSession,
  getAllowedFeatures
} from '../../services/aiV1Api';
import { getApiMessage } from '../../services/apiHelpers';

export default function AIChatPage() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [chatAllowed, setChatAllowed] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    getAllowedFeatures()
      .then(({ data }) => setChatAllowed((data.data?.features || []).includes('chat')))
      .catch(() => setChatAllowed(false));
    getChatSessions()
      .then(({ data }) => setSessions(data.data || []))
      .catch(() => setSessions([]));
  }, []);

  useEffect(() => {
    if (!currentSession) {
      setMessages([]);
      return;
    }
    setLoading(true);
    getChatHistory({ session_id: currentSession.id })
      .then(({ data }) => setMessages(data.data?.messages || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [currentSession?.id]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleNewChat = async () => {
    setError('');
    setSending(true);
    try {
      const { data } = await postChatStart({ title: 'New chat' });
      const session = { id: data.data.session_id, title: data.data.title || 'New chat' };
      setSessions((s) => [session, ...s]);
      setCurrentSession(session);
      setMessages([]);
    } catch (e) {
      setError(getApiMessage(e, 'Could not start chat'));
    } finally {
      setSending(false);
    }
  };

  const handleSelectSession = (session) => {
    setCurrentSession(session);
    setSessionTitle(session.title);
    setEditingTitle(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    if (!chatAllowed) {
      setError('AI Chat is not available in your plan. Please upgrade.');
      return;
    }
    let sessionId = currentSession?.id;
    if (!currentSession) {
      const { data } = await postChatStart({ title: text.slice(0, 50) }).catch((err) => {
        setError(getApiMessage(err, 'Could not start chat'));
        return { data: null };
      });
      if (!data?.data) return;
      const session = { id: data.data.session_id, title: data.data.title || 'New chat' };
      sessionId = session.id;
      setSessions((s) => [session, ...s]);
      setCurrentSession(session);
      setMessages([]);
    }
    setInput('');
    setSending(true);
    setError('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    try {
      const { data } = await postChatMessage({
        session_id: sessionId,
        content: text
      });
      setMessages((m) => [...m, { role: 'assistant', content: data.data?.message || '', tokens_used: data.data?.tokens_used }]);
    } catch (e) {
      setError(getApiMessage(e, 'Failed to get reply'));
      setMessages((m) => m.filter((msg) => msg.role !== 'user' || msg.content !== text));
    } finally {
      setSending(false);
    }
  };

  const handleRename = async () => {
    if (!currentSession || !sessionTitle.trim()) return;
    try {
      await updateChatSession(currentSession.id, { title: sessionTitle.trim() });
      setCurrentSession((s) => ({ ...s, title: sessionTitle.trim() }));
      setSessions((s) => s.map((x) => (x.id === currentSession.id ? { ...x, title: sessionTitle.trim() } : x)));
      setEditingTitle(false);
    } catch (e) {
      setError(getApiMessage(e, 'Rename failed'));
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Delete this chat?')) return;
    try {
      await deleteChatSession(sessionId);
      setSessions((s) => s.filter((x) => x.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (e) {
      setError(getApiMessage(e, 'Delete failed'));
    }
  };

  if (!chatAllowed && sessions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-primary mb-2">AI Legal Assistant</h1>
        <p className="text-gray-600 mb-4">Chat with the AI for legal research and assistance.</p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
          <p className="font-medium">AI Chat is not available in your current plan.</p>
          <p className="text-sm mt-1">Contact your administrator or upgrade your plan to use the Legal Assistant.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] max-w-6xl mx-auto">
      <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <button
            type="button"
            onClick={handleNewChat}
            disabled={sending}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium disabled:opacity-50"
          >
            + New chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {sessions.length === 0 && (
            <p className="text-sm text-gray-500 p-2">No chats yet. Start a new chat.</p>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer ${currentSession?.id === s.id ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
              onClick={() => handleSelectSession(s)}
            >
              <span className="flex-1 truncate">{s.title || 'Chat'}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDeleteSession(s.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10 text-xs"
                title="Delete"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-white border border-gray-200 min-w-0">
        {currentSession ? (
          <>
            <div className="p-3 border-b border-gray-200 flex items-center gap-2">
              {editingTitle ? (
                <>
                  <input
                    type="text"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    autoFocus
                  />
                  <button type="button" onClick={handleRename} className="px-2 py-1 bg-primary text-white rounded text-sm">Save</button>
                  <button type="button" onClick={() => setEditingTitle(false)} className="px-2 py-1 border rounded text-sm">Cancel</button>
                </>
              ) : (
                <>
                  <h2 className="font-medium text-primary truncate flex-1">{currentSession.title}</h2>
                  <button type="button" onClick={() => { setSessionTitle(currentSession.title); setEditingTitle(true); }} className="text-xs text-gray-500 hover:underline">Rename</button>
                </>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Send a message to start the conversation.</p>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.tokens_used && msg.role === 'assistant' && (
                        <p className="text-xs opacity-70 mt-1">{msg.tokens_used} tokens</p>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            {error && (
              <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">{error}</div>
            )}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
                >
                  {sending ? '…' : 'Send'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="mb-4">Select a chat or start a new one to talk to the AI Legal Assistant.</p>
              <button
                type="button"
                onClick={handleNewChat}
                disabled={sending}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                + New chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
