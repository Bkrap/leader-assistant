// components/MmenuWrapper.js
import { useEffect, useRef } from 'react';
import Mmenu from "mmenu-js";
import AdminContent from './AdminContent';

const MmenuWrapper = () => {
  const menuRef = useRef(null);

  useEffect(() => {
    if (menuRef.current) {
      new Mmenu(menuRef.current, {
        // ... your mmenu options
      });
    }
  }, []);

  return (
    <div ref={menuRef}>
      <AdminContent />
      {/* ... rest of your menu items */}
    </div>
  );
};

export default MmenuWrapper;
