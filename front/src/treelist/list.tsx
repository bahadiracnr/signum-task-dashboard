import axios from 'axios';
import { useState, useEffect } from 'react';
import { Tree } from 'primereact/tree';

export default function List() {
  const [nodes, setNodes] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5006/build').then((response) => {
      const transformedData = response.data.map((item) => ({
        key: item.BuildNo,
        label: `${item.BuildName}`,
      }));
      setNodes(transformedData);
    });
  }, []);

  return (
    <div>
      <div className="card flex justify-content-center">
        <Tree
          value={nodes}
          selectionMode="single"
          selectionKeys={selectedKey}
          onSelectionChange={(e) => setSelectedKey(e.value)}
          className="w-full md:w-30rem"
        />
      </div>
    </div>
  );
}
