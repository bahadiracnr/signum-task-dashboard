import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useState, useEffect } from 'react';

export default function Table() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5005/task').then((response) => {
      setData(response.data);
    });
  }, []);

  return (
    <div className="card">
      <DataTable value={data} tableStyle={{ minWidth: '50rem' }}>
        <Column field="no" header="TaskNo"></Column>
        <Column field="location" header="Location"></Column>
        <Column field="status" header="Status"></Column>
      </DataTable>
    </div>
  );
}
