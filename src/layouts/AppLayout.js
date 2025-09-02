import React from 'react';

const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      {/* You can add header, navigation, or footer here */}
      <main>{children}</main>
    </div>
  );
};

export default AppLayout;