import React from "react";

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { key: "container" });
        }
        return child;
      })}
    </div>
  );
};

export default Container;
