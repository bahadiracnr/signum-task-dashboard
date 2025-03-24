import { useState, useEffect } from 'react';
import { Tree } from 'primereact/tree';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import StructureForm from '../form/StructureForm';
import { useRef } from 'react';
import './list.css';
import 'primeicons/primeicons.css';

export default function StructureTreeList() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const toast = useRef<any>(null);

  const fetchTasks = () => {
    setLoading(true);
    axios
      .get('http://localhost:5006/structure?type=BUILD')
      .then((response) => {
        const treeData = response.data.map((item: any) => ({
          label: renderNodeLabel(
            item.coname,
            () => setSelectedTask({ parentId: item.id, type: 'BUILD' }),
            () => handleDelete('BUILD', item.id),
            () =>
              setSelectedTask({
                id: item.id,
                coname: item.coname,
                type: 'BUILD',
              }),
          ),
          data: item.id,
          leaf: !item.hasFloor,
          key: 'Build' + item.no,
          type: 'Build',
          icon: 'pi pi-building',
        }));
        setNodes(treeData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching tree data:', error);
        setLoading(false);
        toast.current.show({
          severity: 'error',
          summary: 'Hata',
          detail: 'Yapı verileri yüklenirken bir hata oluştu',
          life: 3000,
        });
      });
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNodeSelect = (e: any) => {
    setLoading(true);
    const selectedNode = e.node;

    if (selectedNode.type === 'Build') {
      axios
        .get(
          `http://localhost:5006/structure?type=FLOOR&id=${selectedNode.data}`,
        )
        .then((response) => {
          const treeData = response.data.map((item: any) => ({
            label: renderNodeLabel(
              item.coname,
              () => setSelectedTask({ parentId: item.id, type: 'FLOOR' }),
              () => handleDelete('FLOOR', item.id),
              () =>
                setSelectedTask({
                  id: item.id,
                  coname: item.coname,
                  type: 'FLOOR',
                }),
            ),
            data: item.id,
            leaf: !item.hasSpace,
            key: 'Floor' + item.no,
            type: 'Floor',
            icon: 'pi pi-th-large',
          }));
          selectedNode.children = treeData;
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching FLOORs:', error);
          setLoading(false);
          toast.current.show({
            severity: 'error',
            summary: 'Hata',
            detail: 'Kat verileri yüklenirken bir hata oluştu',
            life: 3000,
          });
        });
    } else if (selectedNode.type === 'Floor') {
      axios
        .get(
          `http://localhost:5006/structure?type=SPACE&id=${selectedNode.data}`,
        )
        .then((response) => {
          const treeData = response.data.map((item: any) => ({
            label: renderNodeLabel(
              item.coname,
              () => setSelectedTask({ parentId: item.id, type: 'SPACE' }),
              () => handleDelete('SPACE', item.id),
              () =>
                setSelectedTask({
                  id: item.id,
                  coname: item.coname,
                  type: 'SPACE',
                }),
            ),
            data: item.id,
            leaf: true,
            key: 'Space' + item.no,
            type: 'Space',
            icon: 'pi pi-box',
          }));
          selectedNode.children = treeData;
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching SPACEs:', error);
          setLoading(false);
          toast.current.show({
            severity: 'error',
            summary: 'Hata',
            detail: 'Alan verileri yüklenirken bir hata oluştu',
            life: 3000,
          });
        });
    }
  };

  const handleDelete = async (type: string, id: number) => {
    try {
      await axios.delete(
        `http://localhost:5006/structure?type=${type}&id=${id}`,
      );
      fetchTasks();
      toast.current.show({
        severity: 'success',
        summary: 'Başarılı',
        detail: 'Öğe başarıyla silindi',
        life: 3000,
      });
    } catch (error) {
      console.error('Silme sırasında hata:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Hata',
        detail: 'Silme işlemi başarısız oldu',
        life: 3000,
      });
    }
  };

  const renderNodeLabel = (
    title: string,
    onAdd?: () => void,
    onDelete?: () => void,
    onUpdate?: () => void,
  ) => (
    <div className="tree-node-content">
      <span className="node-title">{title}</span>
      <div className="node-actions">
        {onAdd && (
          <Button
            icon="pi pi-plus"
            className="p-button-rounded p-button-success p-button-text node-action-button"
            tooltip="Yeni ekle"
            tooltipOptions={{ position: 'top' }}
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
            className="p-button-rounded p-button-warning p-button-text node-action-button"
            tooltip="Düzenle"
            tooltipOptions={{ position: 'top' }}
            onClick={(e) => {
              e.stopPropagation();
              onUpdate();
              setFormVisible(true);
            }}
          />
        )}
        {onDelete && (
          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-button-danger p-button-text node-action-button"
            tooltip="Sil"
            tooltipOptions={{ position: 'top' }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="structure-tree-container">
      <Toast ref={toast} />

      <div className="header-section">
        <h2>Yapı Hiyerarşisi</h2>
        <Button
          label="Yeni Bina Ekle"
          icon="pi pi-plus"
          className="p-button-raised"
          onClick={() => {
            setSelectedTask(null);
            setFormVisible(true);
          }}
        />
      </div>

      <div className="tree-container">
        {loading && nodes.length === 0 ? (
          <div className="loading-spinner">
            <ProgressSpinner
              style={{ width: '50px', height: '50px' }}
              strokeWidth="4"
            />
            <p>Veriler yükleniyor...</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="empty-state">
            <i
              className="pi pi-info-circle"
              style={{ fontSize: '2rem', color: 'var(--text-color-secondary)' }}
            ></i>
            <p>Henüz hiç kayıt bulunmuyor.</p>
            <Button
              label="Yeni Bina Ekle"
              icon="pi pi-plus"
              onClick={() => {
                setSelectedTask(null);
                setFormVisible(true);
              }}
            />
          </div>
        ) : (
          <Tree
            value={nodes}
            className="structure-tree"
            selectionMode="single"
            onExpand={handleNodeSelect}
            loading={loading}
            expandedKeys={{}}
            filter
            filterMode="strict"
            filterPlaceholder="Yapıları ara..."
          />
        )}
      </div>

      <StructureForm
        task={selectedTask}
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onTaskSaved={() => {
          setFormVisible(false);
          fetchTasks();
          toast.current.show({
            severity: 'success',
            summary: 'Başarılı',
            detail: 'Kayıt işlemi tamamlandı',
            life: 3000,
          });
        }}
      />
    </div>
  );
}
