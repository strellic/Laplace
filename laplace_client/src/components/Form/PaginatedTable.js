import React from "react";

import {
  Table,
  Pagination,
  PaginationItem,
  PaginationLink
} from "reactstrap";

import { useAlertState } from "context/alert.js";

/*
columns: [
  {title: "a", field: "b"}
],
items: [
  {b: "c"}, {b: "d"}
]
*/

function PaginatedTable({ columns, items, pageSize = 5 }) {
  const pageCount = Math.ceil(items.length / pageSize);
  const [ page, setPage ] = React.useState(0);

  const { setInputOptions } = useAlertState();

  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

  const back = () => {
    setPage(clamp(page - 1, 0, pageCount - 1));
  };
  const forward = () => {
    setPage(clamp(page + 1, 0, pageCount - 1));
  };

  return (
    <>
      <Table>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.slice(page * pageSize, (page + 1) * pageSize).map((item, i) => (
            <tr key={i}>
              {columns.map((col, j) => (
                <td key={j}>{col.formatter ? col.formatter(item) : item[col.field] || ""}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination>

        <PaginationItem>
          <PaginationLink first onClick={() => setPage(0)} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink previous onClick={back} />
        </PaginationItem>

        <PaginationItem active>
          <PaginationLink onClick={() => setInputOptions({
            title: "Input page number",
            body: "Enter page number below:",
            type: "number",
            button: "Navigate",
            value: `${page+1}`,
            submit: (p) => setPage(clamp(parseInt(p) - 1, 0, pageCount - 1)),
            inputOptions: {
              min: 1,
              max: pageCount
            }
          })}>{page + 1}</PaginationLink>
        </PaginationItem>

        <PaginationItem>
          <PaginationLink next onClick={forward} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink last onClick={() => setPage(pageCount - 1)} />
        </PaginationItem>

      </Pagination>
      <p>Showing items <strong>{page * pageSize} - {(page + 1) * pageSize}</strong> of <strong>{items.length}</strong></p>
    </>
  );
}

export default PaginatedTable;