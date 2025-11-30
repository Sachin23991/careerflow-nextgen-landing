// src/components/chat/HistorySidebar.tsx
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageSquare, Trash2, Pencil, Check, X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  title: string;
  createdAt: Timestamp;
}

interface HistorySidebarProps {
  user?: User | null;
  currentSessionId: string | null;
  onSelectSession: (id: string | null) => void;
}

export const HistorySidebar = ({ user, currentSessionId, onSelectSession }: HistorySidebarProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    if (!user) return;
    const sessionsRef = collection(db, 'users', user.uid, 'sessions');
    const q = query(sessionsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userSessions = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title || 'New Chat',
        createdAt: doc.data().createdAt,
      }));
      setSessions(userSessions);
      setLoading(false);
    }, (error) => {
      console.error("Error loading sessions: ", error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!user) return;
    
    if (window.confirm("Are you sure you want to delete this chat history?")) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'sessions', sessionId));
        if (currentSessionId === sessionId) {
          onSelectSession(null);
        }
      } catch (error) {
        console.error("Error deleting session:", error);
      }
    }
  };

  const handleStartRename = (e: React.MouseEvent, session: Session) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!user || !editTitle.trim()) return;
    
    try {
      await updateDoc(doc(db, 'users', user.uid, 'sessions', sessionId), {
        title: editTitle.trim()
      });
      setEditingId(null);
      setEditTitle("");
    } catch (error) {
      console.error("Error renaming session:", error);
    }
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditTitle("");
  };

  return (
    <aside className="w-72 h-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
      {/* New Chat Button */}
      <div className="p-4">
        <Button 
          onClick={() => onSelectSession(null)}
          className="w-full justify-start gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
        >
          <PlusCircle className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* History Section */}
      <div className="flex-1 overflow-y-auto px-3">
        <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          History
        </h3>
        
        {loading && (
          <p className="px-3 py-2 text-sm text-slate-500">Loading...</p>
        )}
        
        <div className="space-y-1">
          {sessions.map(session => (
            <div
              key={session.id}
              onClick={() => !editingId && onSelectSession(session.id)}
              className={cn(
                "group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                currentSessionId === session.id
                  ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              )}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-60" />
              
              {editingId === session.id ? (
                // Edit Mode
                <div className="flex-1 flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(e as any, session.id);
                      if (e.key === 'Escape') handleCancelRename(e as any);
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-100"
                    onClick={(e) => handleSaveRename(e, session.id)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    onClick={handleCancelRename}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                // Display Mode
                <>
                  <span className="flex-1 truncate text-sm">{session.title}</span>
                  
                  {/* Action Buttons - Show on Hover */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-slate-500 hover:text-violet-600 hover:bg-violet-100"
                      onClick={(e) => handleStartRename(e, session)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-slate-500 hover:text-red-600 hover:bg-red-100"
                      onClick={(e) => handleDeleteSession(e, session.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
        {!loading && sessions.length === 0 && (
          <p className="px-3 py-4 text-sm text-slate-500 text-center">
            No history yet.
          </p>
        )}
      </div>
    </aside>
  );
};
