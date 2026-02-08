import React from 'react';
import styles from './Table.module.css';

const Table = ({ columns, data, onRowClick }) => {
    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} className={styles.th} style={{ width: col.width }}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                className={`${styles.tr} ${onRowClick ? styles.interactive : ''}`}
                                onClick={() => onRowClick && onRowClick(row)}
                            >
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className={styles.td}>
                                        {col.render ? col.render(row) : row[col.accessor]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className={styles.empty}>
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
