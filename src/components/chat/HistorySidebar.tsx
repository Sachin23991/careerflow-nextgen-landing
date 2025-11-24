
// src/components/chat/HistorySidebar.tsx (Updated)

import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageSquare, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  title: string;
  createdAt: Timestamp;
}

interface HistorySidebarProps {
  user?: User | null; // allow optional / null user
  currentSessionId: string | null;
  onSelectSession: (id: string | null) => void;
}

export const HistorySidebar = ({ user, currentSessionId, onSelectSession }: HistorySidebarProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Logo logic is REMOVED ---
  
  // Effect to load the user's chat sessions
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

  return (
    <div className="flex h-full w-full max-w-xs flex-col border-r bg-card p-4">
      
      {/* --- Sancara AI Logo & Title REMOVED --- */}

      <Button
        variant="outline"
        className="w-full justify-start gap-2 mb-6"
        onClick={() => onSelectSession(null)} // Select "null" to start a new chat
      >
        <PlusCircle className="h-4 w-4" />
        New Chat
      </Button>

      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        History
      </h2>
      <div className="flex-1 space-y-2 overflow-y-auto pr-2">
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {sessions.map(session => (
          <div 
            key={session.id}
            className={cn(
              "group flex items-center w-full rounded-md border border-transparent transition-colors hover:bg-accent/50",
              currentSessionId === session.id ? "bg-accent text-accent-foreground" : ""
            )}
          >
            <Button
              variant="ghost"
              className={cn(
                "flex-1 justify-start gap-3 truncate bg-transparent hover:bg-transparent h-auto py-2 px-3",
                currentSessionId === session.id && "font-semibold"
              )}
              onClick={() => onSelectSession(session.id)}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="truncate text-left">{session.title}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity mr-1 text-muted-foreground hover:text-destructive"
              onClick={(e) => handleDeleteSession(e, session.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {!loading && sessions.length === 0 && (
          <p className="text-sm text-muted-foreground italic px-2">No history yet.</p>
        )}
      </div>
    </div>
  );
};
