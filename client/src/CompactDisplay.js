import React, { useState } from 'react';

const CompactDisplay = ({ results }) => {
    const [expandedItem, setExpandedItem] = useState(null);

    const handleToggleDetails = (id) => {
        setExpandedItem(expandedItem === id ? null : id);
    };

    return (
        <div>
            {results.map((item) => (
                <div key={item.id} style={styles.card}>
                    <h3>{item.name}</h3>
                    <p><strong>Phones:</strong> {item.phones || 'N/A'}</p>
                    <p><strong>Emails:</strong> {item.emails || 'N/A'}</p>
                    <button onClick={() => handleToggleDetails(item.id)}>
                        {expandedItem === item.id ? 'Hide Details' : 'More Information'}
                    </button>
                    {expandedItem === item.id && (
                        <div style={styles.details}>
                            <p><strong>ID:</strong> {item.id}</p>
                            <p><strong>Aliases:</strong> {item.aliases || 'N/A'}</p>
                            <p><strong>Birthdate:</strong> {item.birth_date || 'N/A'}</p>
                            <p><strong>Country:</strong> {item.countries || 'N/A'}</p>
                            <p><strong>Addresses:</strong> {item.addresses || 'N/A'}</p>
                            <p><strong>Schema:</strong> {item.schema || 'N/A'}</p>
                            <p><strong>Identifiers:</strong> {item.identifiers || 'N/A'}</p>
                            <p><strong>Sanctions:</strong> {item.sanctions || 'N/A'}</p>
                            <p><strong>Dataset:</strong> {item.dataset || 'N/A'}</p> 
                            <p><strong>First Seen:</strong> {item.first_seen || 'N/A'}</p>
                            <p><strong>Last Seen:</strong> {item.last_seen || 'N/A'}</p>
                            <p><strong>Last Change:</strong> {item.last_change || 'N/A'}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const styles = {
    card: {
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '10px',
        margin: '10px 0',
        backgroundColor: '#f9f9f9',
    },
    details: {
        marginTop: '10px',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        backgroundColor: '#fff',
    },
};

export default CompactDisplay;