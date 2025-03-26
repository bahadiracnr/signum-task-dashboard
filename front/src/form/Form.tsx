import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import styles from './Form.module.css';

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
    name: '',
    location: '',
    status: 'TODO',
    description: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        location: task.location || '',
        status: task.status || 'TODO',
        description: task.description || '',
      });
    } else {
      setFormData({ name: '', location: '', status: 'TODO', description: '' });
    }
    setError('');
  }, [task]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (task && task.id !== undefined) {
        await axios.put(`http://localhost:5005/task/${task.id}`, formData);
      } else {
        await axios.post('http://localhost:5005/task', formData);
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

  return (
    <Dialog
      visible={visible}
      style={{ width: '550px' }}
      contentStyle={{ padding: 0, borderRadius: '12px', overflow: 'hidden' }}
      onHide={onHide}
      breakpoints={{ '960px': '95vw' }}
      footer={null}
      draggable={false}
      resizable={false}
      className="p-fluid"
      showHeader={false}
    >
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          {task ? 'Task Güncelle' : 'Yeni Task'}
        </div>

        <div className={styles.formContent}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={(e) => e.preventDefault()}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>
                İsim:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={styles.formInput}
                placeholder="Task ismi girin"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="location" className={styles.formLabel}>
                Konum:
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className={styles.formInput}
                placeholder="Konum bilgisi girin"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="status" className={styles.formLabel}>
                Durum:
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={styles.formSelect}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.formLabel}>
                Açıklama:
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={styles.formTextarea}
                placeholder="Açıklama girin"
              ></textarea>
            </div>
          </form>
        </div>

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
            ) : task ? (
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
