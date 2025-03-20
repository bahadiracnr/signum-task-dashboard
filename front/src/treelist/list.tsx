import { useState, useEffect } from 'react';
import { Tree } from 'primereact/tree';
import axios from 'axios';

export default function BasicDemo() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get('http://localhost:5006/structure?type=BUILD')
      .then((response) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const treeData = response.data.map((item: any) => ({
          label: item.coname,
          data: item.id,
          leaf: item.hasFloor === true ? false : true,
          key: 'Build' + item.no,
          type: 'Build',
        }));
        setNodes(treeData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching tree data:', error);
        setLoading(false);
      });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeSelect = (e: any) => {
    setLoading(true);
    const selectedNode = e.node;

    if (selectedNode.type === 'Build') {
      axios
        .get(
          `http://localhost:5006/structure?type=FLOOR&id=${selectedNode.data}`,
        )
        .then((response) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const treeData = response.data.map((item: any) => ({
            label: item.coname,
            data: item.id,
            leaf: item.hasSpace === true ? false : true,
            key: 'Floor' + item.no,
            type: 'Floor',
          }));
          selectedNode.children = treeData;
          // setNodes((prev) => [...prev]);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching tree data:', error);
          setLoading(false);
        });
    } else if (selectedNode.type === 'Floor') {
      axios
        .get(
          `http://localhost:5006/structure?type=SPACE&id=${selectedNode.data}`,
        )
        .then((response) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const treeData = response.data.map((item: any) => ({
            label: item.coname,
            data: item.id,
            leaf: true,
            key: 'Space' + item.no,
            type: 'Space',
          }));
          selectedNode.children = treeData;
          // setNodes((prev) => [...prev]);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching tree data:', error);
          setLoading(false);
        });
    }
  };

  return (
    <div className="card flex justify-content-center">
      <Tree
        value={nodes}
        className="w-full md:w-30rem"
        selectionMode="single"
        onExpand={handleNodeSelect}
        loading={loading}
      />
    </div>
  );
}
