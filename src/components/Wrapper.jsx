/* eslint-disable */
import React from "react";
import "./Wrapper.css";
import Scene from "./Scene";

const Wrapper = () => {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const scene = new Scene(ref.current);

    return () => scene.destroy();
  }, [ref]);

  return <div className="root" ref={ref} />;
};

export default Wrapper;
