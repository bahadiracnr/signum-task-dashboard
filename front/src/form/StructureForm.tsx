import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import styles from './StructureForm.module.css';

interface FormProps {
  onTaskSaved: () => void;
  task?: any;
  visible: boolean;
  onHide: () => void;
}

export default function Form({
  onTaskSaved,
  task,
  visible,
  onHide,
}: FormProps) {
  const [formData, setFormData] = useState({
    coname: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        coname: task.coname || '',
      });
    } else {
      setFormData({ coname: '' });
    }
    setError('');
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (task && task.id !== undefined && task.type === 'BUILD') {
        await axios.put(
          `http://localhost:5006/structure?type=BUILD&id=${task.id}`,
          formData,
        );
      } else if (task && task.id !== undefined && task.type === 'FLOOR') {
        await axios.put(
          `http://localhost:5006/structure?type=FLOOR&id=${task.id}`,
          formData,
        );
      } else if (task && task.id !== undefined && task.type === 'SPACE') {
        await axios.put(
          `http://localhost:5006/structure?type=SPACE&id=${task.id}`,
          formData,
        );
      } else if (task && task.parentId && task.type === 'FLOOR') {
        await axios.post(
          `http://localhost:5006/structure?type=FLOOR&id=${task.parentId}`,
          formData,
        );
      } else if (task && task.parentId && task.type === 'SPACE') {
        await axios.post(
          `http://localhost:5006/structure?type=SPACE&id=${task.parentId}`,
          formData,
        );
      } else {
        await axios.post(
          'http://localhost:5006/structure?type=BUILD',
          formData,
        );
      }

      onTaskSaved();
      onHide();
    } catch (error) {
      console.error('Gönderim sırasında hata oluştu', error);
      setError('İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const getFormTitle = () => {
    if (task?.id)
      return task?.type === 'BUILD'
        ? 'Bina Güncelle'
        : task?.type === 'FLOOR'
        ? 'Kat Güncelle'
        : 'Alan Güncelle';

    if (task?.type === 'FLOOR') return 'Yeni Kat';
    if (task?.type === 'SPACE') return 'Yeni Alan';
    return 'Yeni Bina';
  };

  return (
    <Dialog
      visible={visible}
      style={{ width: '450px' }}
      contentStyle={{ padding: 0, borderRadius: '12px', overflow: 'hidden' }}
      onHide={onHide}
      breakpoints={{ '960px': '95vw' }}
      footer={null} // Footer'ı kaldırdık, kendimiz ekleyeceğiz
      draggable={false}
      resizable={false}
      className="p-fluid"
      showHeader={false}
    >
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>{getFormTitle()}</div>

        <div className={styles.formContent}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={(e) => e.preventDefault()}>
            <div className={styles.formGroup}>
              <label htmlFor="coname" className={styles.formLabel}>
                Ad:
              </label>
              <input
                type="text"
                id="coname"
                name="coname"
                value={formData.coname}
                onChange={handleChange}
                required
                className={styles.formInput}
                placeholder={`${
                  task?.type === 'FLOOR'
                    ? 'Kat'
                    : task?.type === 'SPACE'
                    ? 'Alan'
                    : 'Bina'
                } ismi girin`}
              />
            </div>
          </form>
        </div>

        {/* Custom footer - card içinde kalacak */}
        <div className={styles.formFooter}>
          <button
            type="button"
            onClick={onHide}
            className={styles.cancelButton}
            disabled={loading}
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={styles.formButton}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className={`-ml-1 mr-2 h-4 w-4 text-white ${styles.loadingSpinner}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                İşleniyor...
              </span>
            ) : task?.id ? (
              'Güncelle'
            ) : (
              'Kaydet'
            )}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
