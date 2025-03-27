import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import './Form.css';

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

  useEffect(() => {
    if (task) {
      setFormData({
        coname: task.coname || '',
      });
    } else {
      setFormData({ coname: '' });
    }
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };

  return (
    <Dialog
      header={task?.id ? 'Güncelle' : 'Yeni Kayıt'}
      visible={visible}
      style={{ width: '30vw' }}
      onHide={onHide}
      breakpoints={{ '960px': '95vw' }}
    >
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <label htmlFor="coname">Ad:</label>
          <input
            type="text"
            id="coname"
            name="coname"
            value={formData.coname}
            onChange={handleChange}
            required
          />

          <button type="submit">{task?.id ? 'Güncelle' : 'Kaydet'}</button>
        </form>
      </div>
    </Dialog>
  );
}
