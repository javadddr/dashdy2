import React, { useState, useEffect } from 'react';

const useShip = () => {
  const [shipments, setShipments] = useState({ documents: [] }); // Initialize with documents as an empty array
  const [users, setUsers] = useState([]);



  return { shipments: shipments.documents,users }; // Return only the documents part
};

export { useShip };