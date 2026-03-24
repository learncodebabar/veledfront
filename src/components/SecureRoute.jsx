import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermission } from '../context/PermissionContext';
import { useState, useEffect } from 'react';

const SecureRoute = ({ children, requiredPageId, fallbackPath = '/unauthorized' }) => {
  const { isAuthenticated, userType, loading: authLoading } = useAuth();
  const { hasAccess, loading: permLoading, permissions } = usePermission();
  const [decision, setDecision] = useState(null);
  const [checkComplete, setCheckComplete] = useState(false);

  useEffect(() => {
    console.log('🔄 SecureRoute Check Started:', {
      requiredPageId,
      authLoading,
      permLoading,
      isAuthenticated,
      userType,
      permissionsCount: Object.keys(permissions).length
    });

    // Agar loading ho rahi hai to wait karo
    if (authLoading || permLoading) {
      console.log('⏳ Waiting for loading to complete...');
      return;
    }

    // Decision لینے کا وقت
    const makeDecision = () => {
      // Not authenticated
      if (!isAuthenticated) {
        console.log('➡️ Not authenticated, redirecting to login');
        setDecision('login');
        setCheckComplete(true);
        return;
      }

      // Admin user
      if (userType === 'admin') {
        console.log('➡️ Admin user, access granted');
        setDecision('render');
        setCheckComplete(true);
        return;
      }

      // Role user
      if (userType === 'role') {
        // Check if permissions are loaded
        if (Object.keys(permissions).length === 0) {
          console.log('⚠️ Permissions not loaded yet, waiting...');
          // یہ حالت نہیں آنی چاہیے کیونکہ permLoading false ہے
          // پھر بھی اگر آئے تو ایک بار اور try کریں
          setTimeout(() => {
            setCheckComplete(true);
          }, 500);
          return;
        }

        const access = hasAccess(requiredPageId);
        console.log(`➡️ Role access for ${requiredPageId}:`, access);
        
        setDecision(access ? 'render' : 'unauthorized');
        setCheckComplete(true);
        return;
      }

      // Fallback
      console.log('➡️ Unknown user type, redirecting to login');
      setDecision('login');
      setCheckComplete(true);
    };

    makeDecision();

  }, [authLoading, permLoading, isAuthenticated, userType, requiredPageId, permissions]);

  // Loading state
  if (authLoading || permLoading || !checkComplete) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>
          {authLoading ? 'Authenticating...' : 
           permLoading ? 'Loading permissions...' : 
           'Checking access...'}
        </p>
        <small style={{ opacity: 0.7 }}>
          {requiredPageId && `Page: ${requiredPageId}`}
        </small>
      </div>
    );
  }

  // Decision based rendering
  if (decision === 'login') {
    console.log('🔴 Redirecting to login');
    return <Navigate to="/" replace />;
  }

  if (decision === 'unauthorized') {
    console.log('🔴 Redirecting to unauthorized');
    return <Navigate to={fallbackPath} replace />;
  }

  // Render children
  console.log('🟢 Rendering protected content');
  return children;
};

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    gap: '15px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    borderTopColor: 'white',
    animation: 'spin 1s ease-in-out infinite'
  }
};

// Global style for animation (ایک بار ڈالیں)
if (!document.querySelector('#secure-route-styles')) {
  const style = document.createElement('style');
  style.id = 'secure-route-styles';
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default SecureRoute;