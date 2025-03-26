import { useState, useEffect } from 'react';
import { Tree } from 'primereact/tree';
import axios from 'axios';
import { Button } from 'primereact/button';
import StructureForm from '../form/StructureForm';
import 'primeicons/primeicons.css';
import styles from './list.module.css';

export default function BasicDemo() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<{ [key: string]: boolean }>(
    {},
  );

  const fetchTasks = () => {
    setLoading(true);
    axios
      .get('http://localhost:5006/structure?type=BUILD')
      .then((response) => {
        const treeData = response.data.map((item: any) => ({
          label: renderNodeLabel(
            item.coname,
            () => setSelectedTask({ parentId: item.id, type: 'FLOOR' }),
            () => handleDelete('BUILD', item.id),
            () =>
              setSelectedTask({
                id: item.id,
                coname: item.coname,
                type: 'BUILD',
              }),
            'BUILD',
          ),
          data: item.id,
          leaf: !item.hasFloor,
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
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = (e: any) => {
    setExpandedKeys(e.value);
  };

  const handleNodeExpand = async (node: any) => {
    if (node.children) return; // Zaten yüklendi

    try {
      let response;
      if (node.type === 'Build') {
        response = await axios.get(
          `http://localhost:5006/structure?type=FLOOR&id=${node.data}`,
        );
      } else if (node.type === 'Floor') {
        response = await axios.get(
          `http://localhost:5006/structure?type=SPACE&id=${node.data}`,
        );
      }

      if (response) {
        const childType = node.type === 'Build' ? 'FLOOR' : 'SPACE';
        const childNodeType = node.type === 'Build' ? 'Floor' : 'Space';
        const children = response.data.map((item: any) => ({
          label: renderNodeLabel(
            item.coname,
            childType === 'FLOOR'
              ? () => setSelectedTask({ parentId: item.id, type: 'SPACE' })
              : undefined,
            () => handleDelete(childType, item.id),
            () =>
              setSelectedTask({
                id: item.id,
                coname: item.coname,
                type: childType,
              }),
            childType,
          ),
          data: item.id,
          leaf: !item.hasSpace,
          key: childNodeType + item.no,
          type: childNodeType,
        }));

        const updatedNodes = [...nodes];
        const insertChildren = (nodes: any[]) => {
          for (const n of nodes) {
            if (n.key === node.key) {
              n.children = children;
              break;
            } else if (n.children) {
              insertChildren(n.children);
            }
          }
        };
        insertChildren(updatedNodes);
        setNodes(updatedNodes);
      }
    } catch (error) {
      console.error('Veri yüklenemedi:', error);
    }
  };

  const handleDelete = async (type: string, id: number) => {
    try {
      await axios.delete(
        `http://localhost:5006/structure?type=${type}&id=${id}`,
      );
      fetchTasks();
    } catch (error) {
      console.error('Silme sırasında hata:', error);
    }
  };

  const getIconClassForType = (type: string) => {
    switch (type) {
      case 'BUILD':
        return styles.buildingIcon;
      case 'FLOOR':
        return styles.floorIcon;
      case 'SPACE':
        return styles.spaceIcon;
      default:
        return '';
    }
  };

  const renderNodeLabel = (
    title: string,
    onAdd?: () => void,
    onDelete?: () => void,
    onUpdate?: () => void,
    nodeType?: string,
  ) => (
    <div className={styles.nodeContainer}>
      <div className={styles.nodeContent}>
        <div className={styles.nodeLabel}>
          {nodeType && (
            <div
              className={`${styles.nodeIcon} ${getIconClassForType(nodeType)}`}
            >
              <i
                className={`pi ${
                  nodeType === 'BUILD'
                    ? 'pi-building'
                    : nodeType === 'FLOOR'
                    ? 'pi-table'
                    : 'pi-box'
                }`}
              ></i>
            </div>
          )}
          <div>
            <div className={styles.nodeTitle}>{title}</div>
          </div>
        </div>
        <div className={styles.nodeActions}>
          {onAdd && (
            <Button
              icon="pi pi-plus"
              className={`${styles.actionButton} ${styles.addButton}`}
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
                setFormVisible(true);
              }}
            />
          )}
          {onUpdate && (
            <Button
              icon="pi pi-pencil"
              className={`${styles.actionButton} ${styles.editButton}`}
              onClick={(e) => {
                e.stopPropagation();
                onUpdate();
                setFormVisible(true);
              }}
            />
          )}
          {onDelete && (
            <Button
              icon="pi pi-minus"
              className={`${styles.actionButton} ${styles.deleteButton}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.treeContainer}>
      <div className={styles.treeHeader}>
        <h2 className={styles.treeTitle}>Yapı Listesi</h2>
        <div className={styles.treeHeaderActions}>
          <Button
            label="Yeni Task Ekle"
            icon="pi pi-plus"
            className={styles.addButton}
            onClick={() => {
              setSelectedTask(null);
              setFormVisible(true);
            }}
          />
        </div>
      </div>

      <div className={styles.treeContent}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <i
              className="pi pi-spin pi-spinner"
              style={{ fontSize: '2rem' }}
            ></i>
            <div className={styles.loadingText}>Yükleniyor...</div>
          </div>
        ) : nodes.length === 0 ? (
          <div className={styles.emptyContainer}>
            <i className={`pi pi-folder-open ${styles.emptyIcon}`}></i>
            <div className={styles.emptyText}>
              Henüz yapı öğesi bulunmamaktadır
            </div>
          </div>
        ) : (
          <div className={styles.treeList}>
            <StructureForm
              task={selectedTask}
              visible={formVisible}
              onHide={() => setFormVisible(false)}
              onTaskSaved={() => {
                setFormVisible(false);
                fetchTasks();
              }}
            />
            <Tree
              value={nodes}
              expandedKeys={expandedKeys}
              onToggle={handleToggle}
              onExpand={(e) => handleNodeExpand(e.node)}
              selectionMode="single"
              loading={loading}
              className={styles.fullWidthTree}
              style={{ width: '100%' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
