// src/table/table.tsx
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import Form from '../form/Form';
import styles from './table.module.css';

export default function Table() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const toast = useRef<any>(null);

  const fetchTasks = () => {
    setLoading(true);
    axios
      .get('http://localhost:5005/task')
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Veri yüklenirken hata oluştu:', error);
        toast.current.show({
          severity: 'error',
          summary: 'Veri Hatası',
          detail: 'Task listesi yüklenirken bir hata oluştu',
          life: 3000,
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async (taskId: number) => {
    try {
      await axios.delete(`http://localhost:5005/task/${taskId}`);
      fetchTasks();
      toast.current.show({
        severity: 'success',
        summary: 'Başarılı',
        detail: 'Task başarıyla silindi',
        life: 3000,
      });
    } catch (error) {
      console.error('Silme sırasında hata oluştu', error);
      toast.current.show({
        severity: 'error',
        summary: 'Silme Hatası',
        detail: 'Task silinirken bir hata oluştu',
        life: 3000,
      });
    }
  };

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'done':
      case 'completed':
      case 'tamamlandı':
        return styles.statusDone;
      case 'todo':
      case 'pending':
      case 'beklemede':
        return styles.statusTodo;
      case 'in_progress':
      case 'devam ediyor':
        return styles.statusInProgress;
      default:
        return '';
    }
  };

  const statusBodyTemplate = (rowData: any) => {
    const className = getStatusClass(rowData.status);
    return <Tag value={rowData.status} className={className} />;
  };

  const actionBodyTemplate = (rowData: any) => {
    return (
      <div className={styles.actionButtons}>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-warning p-button-text"
          tooltip="Düzenle"
          tooltipOptions={{ position: 'top' }}
          onClick={() => {
            setSelectedTask(rowData);
            setFormVisible(true);
          }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-text"
          tooltip="Sil"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleDelete(rowData.id)}
        />
      </div>
    );
  };

  const emptyMessage = (
    <div className={styles.emptyMessage}>
      <i className={`pi pi-info-circle ${styles.emptyIcon}`}></i>
      <p>Görüntülenecek veri bulunamadı</p>
    </div>
  );

  return (
    <div className={styles.taskTableContainer}>
      <Toast ref={toast} />

      <div className={styles.headerSection}>
        <h2>Task Listesi</h2>
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

      {loading ? (
        <div className={styles.loadingContainer}>
          <ProgressSpinner
            style={{ width: '50px', height: '50px' }}
            strokeWidth="4"
          />
          <p>Veriler yükleniyor...</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <DataTable
            value={data}
            paginator
            rows={10}
            dataKey="id"
            loading={loading}
            responsiveLayout="scroll"
            emptyMessage={emptyMessage}
            stripedRows
            showGridlines
            className={styles.taskTable}
          >
            <Column field="no" header="Task No" style={{ width: '10%' }} />
            <Column
              field="status"
              header="Durum"
              body={statusBodyTemplate}
              style={{ width: '15%' }}
            />
            <Column field="name" header="İsim" style={{ width: '20%' }} />
            <Column field="location" header="Konum" style={{ width: '15%' }} />
            <Column
              field="description"
              header="Açıklama"
              style={{ width: '30%' }}
            />
            <Column
              body={actionBodyTemplate}
              header="İşlemler"
              style={{ width: '10%' }}
            />
          </DataTable>
        </div>
      )}

      <Form
        task={selectedTask}
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onTaskSaved={() => {
          setFormVisible(false);
          fetchTasks();
          toast.current.show({
            severity: 'success',
            summary: 'Başarılı',
            detail: selectedTask ? 'Task güncellendi' : 'Yeni task eklendi',
            life: 3000,
          });
        }}
      />
    </div>
  );
}
