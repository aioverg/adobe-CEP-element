import React, { useCallback, useState } from "react";
import Page1 from "./pages/Page1.jsx";
import Page2 from "./pages/Page2.jsx";
import styles from "./App.module.css";
import "./app.css";
import {evalScript} from './utils/index.js'

const Component = () => {
  const [page, setPage] = useState(false);
  
  const getActiveLayerName = useCallback(() => {
    evalScript('main', 'getActiveLayerName', (res) => {
      console.log('激活的图层', res)
    })
  }, []);

  const getDocumentStructureJSON = useCallback(() => {
    evalScript('layer', 'getDocumentStructureJSON', (res) => {
      console.log('文档结构', JSON.parse(res))
    })
  }, []);

  return (
    <div className={styles?.container || ""}>
      <button onClick={getActiveLayerName}>激活的图层</button>
      <button onClick={getDocumentStructureJSON}>文档结构</button>
      <button className={styles?.button || ""} onClick={() => setPage(!page)}>
        切换页面
      </button>
      {page ? <Page1 /> : <Page2 />}
    </div>
  );
};

export default Component;
