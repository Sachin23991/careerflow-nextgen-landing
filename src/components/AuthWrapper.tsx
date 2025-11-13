// src/components/AuthWrapper.tsx
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase'; //
import { useNavigate } from 'react-router-dom';

interface AuthWrapperProps {
  children: (user: User) => React.ReactElement;
}

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        // No user, redirect to login
        navigate('/login');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    // You can replace this with a proper loading spinner component
    return <div>Loading authentication...</div>;
  }

  if (user) {
    // If user is authenticated, render the children components
    // and pass the user object as a prop
    return children(user);
  }

  // This should technically be handled by the navigate, but as a fallback
  return null;
};