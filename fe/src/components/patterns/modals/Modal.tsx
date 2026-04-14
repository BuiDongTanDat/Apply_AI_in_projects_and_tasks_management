import { useState } from "react";

const Modal = () => {
  const [show, setShow] = useState(false);

  return (
    <div>
      <button onClick={() => setShow(true)}>Open Modal</button>
      {show && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShow(false)}>
              &times;
            </span>
            <p>Modal Content</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
