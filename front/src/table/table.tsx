import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { FilterMatchMode } from 'primereact/api';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import Form from '../form/Form';
import './table.css';

export default function Table() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');
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

  const onGlobalFilterChange = (e: any) => {
    const value = e.target.value;
    const _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const getSeverity = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'tamamlandı':
        return 'success';
      case 'in progress':
      case 'devam ediyor':
        return 'info';
      case 'pending':
      case 'beklemede':
        return 'warning';
      case 'cancelled':
      case 'iptal':
        return 'danger';
      default:
        return null;
    }
  };

  const statusBodyTemplate = (rowData: any) => {
    return (
      <Tag value={rowData.status} severity={getSeverity(rowData.status)} />
    );
  };

  const actionBodyTemplate = (rowData: any) => {
    return (
      <div className="action-buttons">
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

  const header = (
    <div className="table-header">
      <div className="flex justify-content-end">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Ara..."
          />
        </span>
      </div>
    </div>
  );

  const emptyMessage = (
    <div className="empty-message">
      <i className="pi pi-info-circle empty-icon"></i>
      <p>Görüntülenecek veri bulunamadı</p>
    </div>
  );

  return (
    <div className="task-table-container">
      <Toast ref={toast} />

      <div className="header-section">
        <h2>Task Listesi</h2>
        <Button
          label="Yeni Task Ekle"
          icon="pi pi-plus"
          className="p-button-raised"
          onClick={() => {
            setSelectedTask(null);
            setFormVisible(true);
          }}
        />
      </div>

      {loading ? (
        <div className="loading-container">
          <ProgressSpinner
            style={{ width: '50px', height: '50px' }}
            strokeWidth="4"
          />
          <p>Veriler yükleniyor...</p>
        </div>
      ) : (
        <div className="table-container">
          <DataTable
            value={data}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            dataKey="id"
            filters={filters}
            filterDisplay="menu"
            loading={loading}
            responsiveLayout="scroll"
            emptyMessage={emptyMessage}
            header={header}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Toplam {totalRecords} kayıttan {first} - {last} arası gösteriliyor"
            stripedRows
            showGridlines
            className="task-table"
          >
            <Column
              field="no"
              header="Task No"
              sortable
              filter
              style={{ width: '10%' }}
            />
            <Column
              field="status"
              header="Durum"
              body={statusBodyTemplate}
              sortable
              filter
              filterPlaceholder="Duruma göre filtrele"
              style={{ width: '15%' }}
            />
            <Column
              field="name"
              header="İsim"
              sortable
              filter
              style={{ width: '20%' }}
            />
            <Column
              field="location"
              header="Konum"
              sortable
              filter
              style={{ width: '15%' }}
            />
            <Column
              field="description"
              header="Açıklama"
              sortable
              filter
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
