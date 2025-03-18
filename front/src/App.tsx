import { Card } from 'primereact/card';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import List from './treelist/list';
import Table from './table/table';
import Navbar from './navbar/navbar';

export default function App() {
  return (
    <BrowserRouter>
      <div>
        <div className="nav">
          <Navbar></Navbar>
        </div>
        <div className="parent">
          <div className="div1">
            <Card className="cardHeight">
              <div>
                <NavLink to="/">List</NavLink>
              </div>
              <div>
                <NavLink to="/tasks">Table</NavLink>
              </div>
            </Card>
          </div>
          <div className="div2">
            <Card className="cardHeight">
              <Routes>
                <Route path="/" element={<List />} />
                <Route path="/tasks" element={<Table />} />
              </Routes>
            </Card>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
