import React from 'react';
import { Outlet } from 'react-router-dom';

const LayoutPolicies: React.FC = () => {
  return (
    <div>
      <main>
        <Outlet />
      </main>
      <footer>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam reprehenderit veniam quibusdam
        eos ut laborum iure sit non labore tempora ipsa quidem laboriosam harum consectetur
        molestiae, expedita dolores accusamus sunt?
      </footer>
    </div>
  );
};

export default LayoutPolicies;
