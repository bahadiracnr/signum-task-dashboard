// import React, { useState, useEffect } from 'react';
// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';
// import { ProductService } from './service/ProductService';

// interface Product {
//   taskNo: number;
//   location: string;
//   status: string;
// }

// export default function BasicDemo() {
//   const [products, setProducts] = useState<Product[]>([]);

//   useEffect(() => {
//     ProductService.getProductsMini().then((data) => setProducts(data));
//   }, []);

//   return (
//     <div className="card">
//       <DataTable value={products} tableStyle={{ minWidth: '50rem' }}>
//         <Column field="taskNo" header="Code"></Column>
//         <Column field="Location" header="Name"></Column>
//         <Column field="Status" header="Category"></Column>
//       </DataTable>
//     </div>
//   );
// }

export default function table() {
  return <div>table</div>;
}
