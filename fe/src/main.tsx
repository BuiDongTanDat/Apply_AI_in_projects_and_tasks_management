import { createRoot } from "react-dom/client";

import "./index.css";
import "./style/main.scss";
import App from "./App.tsx";
import { AlertProvider } from "./provider/AlertProvider.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";

createRoot(document.getElementById("root")!).render(
  <AlertProvider>
    <Provider store={store}>
      <App />
    </Provider>
  </AlertProvider>
);
